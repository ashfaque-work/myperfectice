import { canOnlySeeLocationContents, getUniqueCode, LocationRepository, NotificationRepository, PracticeSetRepository, QuestionRepository, RedisCaching, SubjectRepository, TopicRepository, UnitRepository, UsersRepository } from "@app/common";
import { GrpcInternalException, GrpcInvalidArgumentException } from "nestjs-grpc-exceptions";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MessageCenter } from "@app/common/components/messageCenter";
import { config, getAssets } from "@app/common/config";
import { S3Service } from "@app/common/components/aws/s3.service";
import { catchError, firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { Types } from 'mongoose';
import * as DecompressZip from 'decompress-zip';
import * as FormData from 'form-data';
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class PracticeSetExcelService {

    constructor(
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly topicRepository: TopicRepository,
        private readonly unitRepository: UnitRepository,
        private readonly usersRepository: UsersRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly locationRepository: LocationRepository,
        private readonly redisCache: RedisCaching,
        private readonly messageCenter: MessageCenter,
        private s3Service: S3Service,
        private readonly httpService: HttpService
    ) { }

    //Internal Functions - start
    private async sendErrorsUpload(req: any, err: any, user: any) {
        this.notificationRepository.setInstanceKey(req.instancekey);
        this.notificationRepository.create({
            receiver: user._id,
            type: 'notification',
            modelId: 'upload',
            subject: req.body.QB ? 'Question upload processing failed' : 'Practice test processing failed'
        })

        const options = {
            user: user,
            userId: user._id.toString(),
            errors: err.errors,
            fileName: err.fileName,
            startDate: moment().format('MMM DD, YYYY HH:mm:ss'),
            successes: err.successes,
            summary: err.summary,
            subject: req.body.QB ? 'Question upload status' : 'Practice Test upload status'
        }

        let dataMsgCenter: any = {
            receiver: user._id,
            modelId: 'failUploadTest'
        }

        if (user.email) {
            dataMsgCenter.to = user.email;
            dataMsgCenter.isScheduled = true;
        }

        this.messageCenter.sendWithTemplate(req, 'upload-error-email', options, dataMsgCenter)
    }

    private escapeRegExp(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    private regexName(name: string): any {
        return { $regex: new RegExp(["^", this.escapeRegExp(name).replace(/\s+/g, ' ').trim(), "$"].join(""), 'gi') };
    }

    private replaceAll(ignoreCase: boolean, str: string, search: string, replace: string): string {
        return str.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ignoreCase ? 'gi' : 'g'), replace);
    }

    private async parseExcelSheet(workbook: any, sheetIndex: number): Promise<any[]> {
        try {
            let first_sheet_name = workbook.SheetNames[sheetIndex];
            let worksheet = workbook.Sheets[first_sheet_name];
            let output = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
            return output;
        } catch (err) {
            throw new Error(`Error parsing Excel sheet: ${err.message}`);
        }
    }

    private async parseQuestionXlsx(req: any, buffer: Buffer, options: any): Promise<any> {
        const workbook: any = XLSX.read(buffer, { type: 'buffer' });
        if (workbook) {
            let sheetTwo = workbook.SheetNames[0];

            if (sheetTwo) {
                const questionsSheet = workbook.Sheets[sheetTwo];
                if (questionsSheet['!ref']) {
                    const questionRange = questionsSheet['!ref'].split(':');
                    workbook.Sheets[sheetTwo]['!ref'] = `A1:${questionRange[1]}`;
                }
            }

            const data = await this.parseExcelSheet(workbook, 0);
            const hasErrors = {
                sheet1: {},
                sheet2: { grade: false, subject: false },
            };
            const errors = [];
            let recordSuccess = 0;
            let recordErrors = 0;
            const summary = { totalQuestion: 0, recordSuccess: 0, recordErrors: 0 };

            try {
                await this.processQuestions(req, data, errors, hasErrors, summary, recordSuccess, recordErrors, options);

                if (errors.length) {
                    throw {
                        message: 'Errors upload',
                        errors,
                        successes: [],
                        summary,
                    };
                } else {
                    return data;
                }
            } catch (err) {
                throw err;
            }
        }
    }

    private async processQuestions(
        req: any,
        data: any,
        errors: any[],
        hasErrors: any,
        summary: any,
        recordSuccess: number,
        recordErrors: number,
        options: any
    ) {
        let row = 1;
        let record = 0;

        if (data.length < 1) {
            errors.push({ param: 'question', message: 'No question found in sheet `Questions`.' });
            throw { status: 2, message: 'No question found in sheet `Questions`' };
        }

        let test: any;
        if (req.body.testId) {
            test = await this.practiceSetRepository.findById(req.body.testId, { subjects: 1, units: 1 });

            if (!test) {
                errors.push({ param: 'question', message: 'Test not found.' });
                throw { status: 2, message: 'Invalid test id' };
            }
        }

        data.splice(0, 1);

        for (const question of data) {
            record += 1;
            row += 1;
            const isSuccess = await this.processQuestion(req, options, question, row, test, errors, hasErrors);
            if (isSuccess) {
                recordSuccess += 1;
            } else {
                recordErrors += 1;
            }
        }

        summary.recordSuccess = recordSuccess;
        summary.recordErrors = recordErrors;
    }

    private async processQuestion(req: any, options: any, question: any, row: number, test: any, errors: any[], hasErrors: any) {
        let isSuccess: any = true;
        const subject = question[0];
        const unitName = question[1];
        const result = {
            questionType: 'single',
            answers: [],
            answerNumber: 0,
        };

        try {
            const subjectItem = await this.checkSubject(req, subject, row, test, errors, hasErrors, result);
            const unit = await this.checkUnit(req, unitName, row, subjectItem, test, errors, hasErrors, result);
            const topic = await this.checkTopic(req, unit, question[2], row, errors, hasErrors, result);
            await this.checkComplexity(question[3], row, errors, hasErrors, result);
            await this.checkQuestionBank(question[16], row, errors, hasErrors, result);
            await this.checkQuestionText(req, options, question, row, errors, hasErrors, result);
            await this.checkMarks(question, row, errors, hasErrors, result);
            await this.checkAnswers(options, question, row, errors, hasErrors, result);
            await this.checkCodingData(options, question, row, errors, hasErrors, result);

            return isSuccess;
        } catch (error) {
            isSuccess = false;
        }
        return isSuccess;
    }

    private async checkSubject(req: any, subject: any, row: number, test: any, errors: any[], hasErrors: any, result: any) {
        if (!subject) {
            errors.push({ param: 'subject', message: `[A:${row}] Subject is required in sheet \`Questions\`` });
            hasErrors.sheet2.subject = true;
            return;
        }
        let subjectItem: any = {};
        const filterSubject = this.regexName(subject);
        try {
            subjectItem = await this.subjectRepository.findOne({ name: filterSubject });
            if (!subjectItem) {
                errors.push({ params: 'subject', message: `[A:${row}] Subject \`${subject}\` not found in database in sheet 'Questions'` });
                hasErrors.sheet2.subject = true;
                return;
            }
            if ((test && !test.subjects.find((s: any) => s._id.equals(subjectItem._id)))) {
                errors.push({ params: 'subject', message: `[A:${row}] Subject \`${subject}\` not found in the test` });
                hasErrors.sheet2.subject = true;
                return;
            }
        } catch (err) {
            if (err) {
                errors.push({ params: 'subject', message: `[A:${row}] Subject \`${subject}\` is not avaliable in sheet 'Questions'` });
                hasErrors.sheet2.subject = true;
                return;
            }
        }

        result.subject = { _id: subjectItem._id, name: subjectItem.name, level: 0 };
        return subjectItem;
    }

    private async findUnit(req: any, unitName: string, row: number): Promise<any> {
        try {
            var filterUnit = this.regexName(unitName);
            const unit = this.unitRepository.findOne({ name: filterUnit });
            if (!unit) {
                throw new BadRequestException([{ params: 'unit', message: "[A:" + row + "] Unit `" + unitName + "` is not avaliable in sheet `Questions`" }]);
            }

            return unit;
        } catch (err) {

        }
    }

    private async checkUnit(req: any, unitName: any, row: number, subjectItem: any, test: any, errors: any[], hasErrors: any, result: any) {
        if (!unitName) {
            errors.push({ params: 'unit', message: `[B:${row}] Unit is required in sheet \`Questions\`` });
            hasErrors.sheet2.unit = true;
            throw new Error();
        }

        if (!subjectItem) {
            errors.push({ params: 'subject', message: `[B:${row}] Unit requires Subject in sheet \`Questions\`` });
            hasErrors.sheet2.unit = true;
            throw new Error();
        }
        let unit: any = {};
        try {
            unit = await this.findUnit(req, unitName, row);
            if (test && !test.units.find((u: any) => u._id.equals(unit._id))) {
                errors.push({ params: 'unit', message: `[A:${row}] unit \`${unitName}\` not found in the test` });
                hasErrors.sheet2.subject = true;
            }
            result.unit = { _id: unit._id, name: unit.name };
            return unit;
        } catch (err) {
            errors = errors.concat(err);
            hasErrors.sheet2.unit = true;
        }
    }

    private async getTopic(req: any, unit: any, topicName: string, row: number): Promise<any> {
        const filterName = this.regexName(topicName);

        const topic = this.topicRepository.findOne({ unit: unit._id, name: filterName, $or: [{ "active": { $exists: false } }, { "active": true }] });
        if (!topic) {
            throw new BadRequestException([{ params: 'Topic', 'message': "[C:" + row + "] Topic `" + topicName + "` of Unit `" + unit.name + "` is inactive or not available in database" }]);
        }
        return topic;
    }

    private async checkTopic(req: any, unit: any, topicName: any, row: number, errors: any[], hasErrors: any, result: any) {
        if (!topicName) {
            errors.push({ param: 'topic', message: `[C:${row}] Topic is required in sheet \`Questions\`` });
            hasErrors.sheet2.topic = true;
            return;
        }
        if (!unit) {
            errors.push({ param: 'topic', message: `[C:${row}] Topic requires subject in sheet \`Questions\`` });
            hasErrors.sheet2.topic = true;
            return;
        }
        else {
            result.unit = {
                _id: unit._id,
                name: unit.name
            };
        }

        try {
            const topic = await this.getTopic(req, unit, topicName, row);
            return topic;
        } catch (err) {
            hasErrors.sheet2.topic = true;
            errors = errors.concat(err);
        }
    }

    private async checkComplexity(complexity: any, row: number, errors: any[], hasErrors: any, result: any) {
        if (!complexity) {
            errors.push({ param: 'complexity', message: `[D:${row}] Complexity  is required in sheet \`Questions\`` });
            hasErrors.sheet2.complexity = true;
        }

        complexity = complexity.toLowerCase().trim();
        if (!['easy', 'moderate', 'hard'].includes(complexity)) {
            errors.push({ param: 'complexity', message: `[D:${row}] \`${complexity}\` is not a valid enum value for path \`complexity\`` });
            hasErrors.sheet2.complexity = true;
        }

        result.complexity = complexity;
        return complexity
    }

    private async checkQuestionBank(questionBank: any, row: number, errors: any[], hasErrors: any, result: any) {
        if (questionBank) {
            questionBank = questionBank.toLowerCase().trim();
            if (!['global', 'self', 'none'].includes(questionBank)) {
                errors.push({ param: 'questionBank', message: `[D:${row}] \`${questionBank}\` is not a valid value for path \`complexity\`` });
                hasErrors.sheet2.questionBank = true;
            } else {
                result.isAllowReuse = questionBank;
            }
        }
        return questionBank;
    }

    private async checkQuestionText(req: any, options: any, question: any, row: number, errors: any[], hasErrors: any, result: any) {
        let questionHeader = question[4] ? question[4].toString() : '';
        let questionText = question[7] ? question[7].toString() : '';
        let answerExplain = question[14] ? question[14].toString() : '';
        let category = question[15] ? question[15] : 'mcq';

        if (!questionText.trim()) {
            errors.push({ param: 'questionText', message: `[H:${row}] Question text is required in sheet \`Questions\`` });
            hasErrors.sheet2.questionText = true;
        }

        questionText = this.replaceAll(false, questionText, "_x000d_", "");
        questionText = this.replaceAll(false, questionText, "_x000b_", " ");
        questionHeader = this.replaceAll(false, questionHeader, "_x000d_", "");
        questionHeader = this.replaceAll(false, questionHeader, "_x000b_", " ");
        answerExplain = this.replaceAll(true, answerExplain, "_x000d_", "");
        answerExplain = this.replaceAll(true, answerExplain, "_x000b_", " ");

        if (options.user) {
            answerExplain = this.replaceAll(true, answerExplain, '{unique_user_id}', options.user._id.toString());
            answerExplain = this.replaceAll(true, answerExplain, '%7Bunique_user_id%7D', options.user._id.toString());
            questionText = this.replaceAll(false, questionText, '{unique_user_id}', options.user._id.toString());
            questionText = this.replaceAll(false, questionText, '%7Bunique_user_id%7D', options.user._id.toString());
            questionHeader = this.replaceAll(false, questionHeader, '{unique_user_id}', options.user._id.toString());
            questionHeader = this.replaceAll(false, questionHeader, '%7Bunique_user_id%7D', options.user._id.toString());
        }

        // Update test folder name which contains all images of the test
        if (options.uniqTestFolderName) {
            if (answerExplain.indexOf('unique_test_name') > -1) {
                answerExplain = this.replaceAll(true, answerExplain, '{unique_test_name}', options.uniqTestFolderName);
                answerExplain = this.replaceAll(true, answerExplain, '%7Bunique_test_name%7D', options.uniqTestFolderName);
            }

            if (questionText.indexOf('unique_test_name') > -1) {
                questionText = this.replaceAll(false, questionText, '{unique_test_name}', options.uniqTestFolderName);
                questionText = this.replaceAll(false, questionText, '%7Bunique_test_name%7D', options.uniqTestFolderName);
            }

            if (questionHeader.indexOf('unique_test_name') > -1) {
                questionHeader = this.replaceAll(false, questionHeader, '{unique_test_name}', options.uniqTestFolderName);
                questionHeader = this.replaceAll(false, questionHeader, '%7Bunique_test_name%7D', options.uniqTestFolderName);
            }
        }

        result.questionHeader = questionHeader;
        result.questionText = questionText;
        result.answerExplain = answerExplain;

        let validCategory = ['mcq', 'fib', 'code', 'descriptive']

        if (validCategory.indexOf(category) >= 0) {
            result.category = category;
        } else {
            hasErrors.sheet2.category = true;
            errors.push({ param: 'category', message: '[H:' + row + '] Question category is empty or not valid' });
        }

        result.wordLimit = question[22] ? question[22] : 1;

        if (question[23]) {
            result.order = question[23]
        }

        return result;
    }

    private async checkMarks(question: any, row: number, errors: any[], hasErrors: any, result: any) {
        const minusMark = question[6] === undefined ? 0 : question[6];
        const plusMark = question[5] === undefined ? 0 : question[5];

        if (isNaN(parseFloat(plusMark))) {
            errors.push({ params: 'plusMark', message: `[F:${row}] Cast to float failed for value \`${plusMark}\` at Positive marks in sheet pracitce` });
            hasErrors.sheet2.plusMark = true;
        }

        if (isNaN(parseFloat(minusMark))) {
            errors.push({ params: 'minusMark', message: `[G:${row}] Cast to float failed for value \`${minusMark}\` at Negative marks in sheet pracitce` });
            hasErrors.sheet2.minusMark = true;
        }

        result.minusMark = minusMark;
        result.plusMark = plusMark;
        return result;
    }

    private async checkAnswers(options: any, question: any, row: number, errors: any[], hasErrors: any, result: any) {
        const answerOptions = question[13] ? question[13].toString().split(',') : [];
        let answerNumber = 0;
        let isCorrectAnswer = 0;
        const coloumOptions = [8, 9, 10, 11, 12];

        if (!question[13] && result.category !== 'fib') {
            errors.push({ param: 'Answer', message: `[N:${row}] Answer is required in sheet \`Questions\`` });
            hasErrors.sheet2.answer = true;
            throw new Error();
        }

        if (answerOptions.length > 1) {
            result.questionType = 'multiple';
        }

        for (const i in coloumOptions) {
            const j = coloumOptions[i];
            const answerText = question[j] ? question[j].toString() : '';

            if (answerText) {
                answerNumber += 1;
                const answers = { answerText: this.replaceAll(false, answerText, '_x000d_', ''), isCorrectAnswer: false };

                if (options.user) {
                    answers.answerText = this.replaceAll(false, answers.answerText, '{unique_user_id}', options.user._id.toString());
                    answers.answerText = this.replaceAll(false, answers.answerText, '%7Bunique_user_id%7D', options.user._id.toString());
                }

                if (options.uniqTestFolderName && answers.answerText.includes('unique_test_name')) {
                    answers.answerText = this.replaceAll(false, answers.answerText, '{unique_test_name}', options.uniqTestFolderName);
                    answers.answerText = this.replaceAll(false, answers.answerText, '%7Bunique_test_name%7D', options.uniqTestFolderName);
                }

                const opt = answerOptions.find((a: any) => a && parseInt(a) === parseInt(i) + 1);
                if (opt) {
                    isCorrectAnswer += 1;
                    answers.isCorrectAnswer = true;
                }

                result.answers.push(answers);
            }
        }

        result.answerNumber = answerNumber;
        if (result.category === 'mcq') {
            if (answerNumber < 2) {
                errors.push({ param: 'answerNumber', message: `[N:${row}] Min answer must be equal to 2 please insert more answer in sheet \`Questions\`` });
                hasErrors.sheet2.answerNumber = true;
            }
            if (!isCorrectAnswer) {
                errors.push({ param: 'isCorrectAnswer', message: `[N:${row}] No Answer correct is selected in sheet \`Questions\`` });
                hasErrors.sheet2.isCorrectAnswer = true;
            }
        } else if (result.category === 'code') {
            // Add default answers for code question
            answerNumber = 1;
            result.answers.push({ answerText: '', isCorrectAnswer: false });
        } else if (result.category === 'fib') {
            // Support fib question type
            // No answer entry need for fib, we gonna parse answer from questionText {{}}
            const answers = [];
            const regex = /\{{([^}]+)\}}/mg;
            let m: any;

            while ((m = regex.exec(result.questionText)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                const answer = { answerText: m[1], isCorrectAnswer: true };
                answers.push(answer);
            }

            result.answers = answers;
            answerNumber = answers.length;
            result.questionType = 'single';
        }
        result.answerNumber = answerNumber;
        return result;
    }

    async checkCodingData(options: any, question: any, row: number, errors: any[], hasErrors: any, result: any) {
        try {
            if (result.category === 'code') {
                const hasUserInput = question[17] ? question[17] : '';
                const userInputDescription = question[18] ? question[18] : '';
                const hasArg = question[19] ? question[19] : '';
                const argumentDescription = question[20] ? question[20] : '';
                const coding = question[21] ? question[21] : '';

                if (coding !== '') {
                    result.hasUserInput = hasUserInput === '1';
                    result.userInputDescription = userInputDescription;
                    result.hasArg = hasArg === '1';
                    result.argumentDescription = argumentDescription;
                    result.coding = JSON.parse(coding);

                    // Remove unnecessary fields
                    for (let idx = 0; idx < result.coding.length; idx++) {
                        delete result.coding[idx]._id;
                        for (let tdx = 0; tdx < result.coding[idx].testcases.length; tdx++) {
                            delete result.coding[idx].testcases[tdx]._id;
                        }
                    }
                } else {
                    hasErrors.sheet2.coding = true;
                    errors.push({ param: 'coding', message: `[N:${row}] No coding data in sheet \`Questions\`` });
                }
            }

            return result;
        } catch (e) {
            Logger.error('Coding data parse error %o', e);
            return result;
        }
    }

    async storeQuestionData(req: any, data: any): Promise<any> {
        const createdTime = new Date();
        let savedQuestionsCount = 0;
        let test = null;

        if (req.body.testId) {
            test = await this.practiceSetRepository.findById(req.body.testId);
        }

        try {
            for (let idx = 0; idx < data.length; idx++) {
                let question = data[idx];
                let prefferLanguage = ['English'];
                let errors = [];
                let questionTextArr = [];
                let answerExplainArr = [];

                let getExplanationText = question.answerExplain;
                let getQuestionText = question.questionText;
                let getpreferLanguage = getQuestionText.match(/[^{}]+(?=\})/g);
                let getpreferLanguage1 = getQuestionText.match(/\{([^}]+)\}/gm);
                let expLanguage1 = getExplanationText.match(/\{([^}]+)\}/gm);

                if (getpreferLanguage && getpreferLanguage.length > 0 && (getpreferLanguage == "Marathi" || getpreferLanguage == "marathi")) {
                    prefferLanguage.push(getpreferLanguage[0]);
                    questionTextArr = getQuestionText.split(getpreferLanguage1[0]);

                    for (let i in question.answers) {
                        let getAnswer = question.answers[i].answerText;
                        let isLanguage = getAnswer.match(/[^{}]+(?=\})/g);
                        let isLanguage1 = getAnswer.match(/\{([^}]+)\}/gm);

                        if (isLanguage && isLanguage.length > 0) {
                            question.answers[i].answerTextArray = getAnswer.split(isLanguage1[0]);
                        } else {
                            errors.push({ param: 'options', message: 'Add both languages in sheet `Questions` options.' });
                            throw new BadRequestException({
                                message: 'Errors upload',
                                errors: errors,
                                successes: []
                            });
                        }

                        if (getExplanationText.trim() !== '') {
                            if (expLanguage1 && expLanguage1.length > 0) {
                                answerExplainArr = getExplanationText.split(expLanguage1[0]);
                            } else {
                                errors.push({ param: 'options', message: 'Add both languages in sheet `Questions` answer explanation.' });
                                throw new BadRequestException({
                                    message: 'Errors upload',
                                    errors: errors,
                                    successes: []
                                });
                            }
                        }
                    }
                } else {
                    questionTextArr.push(getQuestionText);
                    answerExplainArr.push(getExplanationText);

                    for (let i in question.answers) {
                        let getAnswer = question.answers[i].answerText;
                        question.answers[i].answerTextArray = getAnswer;
                    }
                }

                question.prefferedLanguage = prefferLanguage;
                question.questionTextArray = questionTextArr;
                question.answerExplainArr = answerExplainArr;
                question.createdAt = new Date(createdTime.getTime() + 100 * idx);
                question.practiceSets = [];

                if (req.body.isAllowReuse) {
                    question.isAllowReuse = req.body.isAllowReuse;
                } else {
                    question.isAllowReuse = 'none';
                }

                if (req.body.testId) {
                    question.practiceSets.push(new Types.ObjectId(req.body.testId));
                }

                question.tags = [];
                if (req.body.tags) {
                    question.tags = req.body.tags.split(',');
                }

                if (data.tags) {
                    let tempTags = data.tags.split(',');
                    let mergeTags = question.tags.concat(tempTags);
                    const uniqueArray = mergeTags.filter((item, index) => mergeTags.indexOf(item) === index);
                    question.tags = uniqueArray;
                }

                try {
                    const newQuestion = await this.questionRepository.create(_.assign({
                        user: new Types.ObjectId(req.user._id),
                        location: req.user.activeLocation,
                        prefferedLanguage: prefferLanguage,
                        questionTextArray: questionTextArr,
                        answerExplainArr: answerExplainArr,
                        userRole: req.user.roles[0]
                    }, _.pick(question, 'subject', 'unit', 'topic', 'practiceSets', 'createdAt', 'questionType', 'answerNumber', 'questionHeader',
                        'minusMark', 'plusMark', 'complexity', 'tags', 'questionText', 'answerExplain', 'isAllowReuse', 'answers',
                        'category', 'hasUserInput', 'userInputDescription', 'hasArg', 'argumentDescription', 'coding', 'wordLimit')));

                    if (canOnlySeeLocationContents(req.user.roles)) {
                        await this.questionRepository.findByIdAndUpdate(newQuestion._id, { locations: [req.user.activeLocation] })
                    }

                    // Add question to test if testId is provided
                    if (req.body.testId && test) {
                        let q = {
                            question: newQuestion._id,
                            createdAt: new Date(),
                            order: test.questions.length + 1
                        };

                        test.questions.push(q);
                        await this.practiceSetRepository.updateOne({ _id: req.body.testId }, { $push: { questions: q } });
                    }

                    savedQuestionsCount++;

                    // add question to test
                    if (req.body.testId && test) {
                        let q = {
                            question: newQuestion._id,
                            createdAt: new Date(),
                            order: test.questions.length + 1
                        }

                        test.questions.push(q)
                        await this.practiceSetRepository.updateOne({ _id: req.body.testId }, { $push: { questions: q } })
                    }
                } catch (err) {
                    throw new Error(`Error saving question: ${err.message}`);
                }
            }

            // Update totalQuestion count in PracticeSet if testId and savedQuestionsCount are valid
            if (req.body.testId && savedQuestionsCount) {
                await this.practiceSetRepository.updateOne(
                    { _id: req.body.testId },
                    { $inc: { totalQuestion: savedQuestionsCount } }
                );
            }

            return data;
        } catch (err) {
            Logger.error(`Error storing question data: ${err.message}`);
            throw new GrpcInternalException('Failed to store question data');
        }
    }

    private async importQuestionExcelFileByObject(file: any, uploadDir: any, uniqTestFolderName: any, req: any): Promise<any> {
        const fileName = file.filename;
        const currentPath = file.path;
        const filePath = path.join(uploadDir, currentPath);

        // Ensure the directory exists
        await fsExtra.ensureDir(path.dirname(filePath));
        await fs.promises.rename(currentPath, filePath);

        const dirPath = path.join(path.dirname(uploadDir), path.dirname(currentPath));

        try {
            const data = await this.parseQuestionXlsx(req, fs.readFileSync(filePath), {
                user: req.user,
                uniqTestFolderName: uniqTestFolderName,
                dirPath: dirPath,
            });

            const uploadData = { ...data };
            delete uploadData.summary;
            delete uploadData.errors;

            const questions = await this.storeQuestionData(req, uploadData);

            const finalDirPath = dirPath.endsWith(req.user._id.toString())
                ? path.join(dirPath, uniqTestFolderName)
                : path.join(path.dirname(dirPath), uniqTestFolderName);

            return { questions: questions, dirPath: finalDirPath };
        } catch (err) {
            err['fileName'] = fileName;
            this.sendErrorsUpload(req, err, req.user);
            return;
        }
    }

    async parseXlsx(req: any, filePath: string, options: any): Promise<any> {
        const settings = await this.redisCache.getSetting(req);

        const file = path.resolve(filePath);
        const workbook = XLSX.readFile(file);
        const wopts: any = { bookType: 'xlsx', bookSST: true, type: 'binary' };

        if (workbook) {
            const sheetOne = workbook.SheetNames[0];
            const sheetTwo = workbook.SheetNames[1] || null;
            const practiceSheet = workbook.Sheets[sheetOne];

            if (workbook.Sheets[sheetOne]["!ref"]) {
                const practiceRange = practiceSheet["!ref"].split(':');
                workbook.Sheets[sheetOne]["!ref"] = "A1:" + practiceRange[1];
            }
            if (sheetTwo) {
                const questionsSheet = workbook.Sheets[sheetTwo];
                if (questionsSheet["!ref"]) {
                    const questionRange = questionsSheet["!ref"].split(':');
                    workbook.Sheets[sheetTwo]["!ref"] = "A1:" + questionRange[1];
                }
            }

            const uploadFilePath = getAssets(req.instancekey) + '/uploads/files';
            const newFile = `${uploadFilePath}/${Math.random().toString(36).substring(7)}.xlsx`;

            XLSX.writeFile(workbook, newFile, wopts);
            await fsExtra.chmod(newFile, '0777');

            const practiceData = await this.parseExcelSheet(file, 0);
            const hasErrors = { sheet1: {}, sheet2: { grade: false, subject: false } };
            const errors = [];
            let recordSuccess = 0;
            let recordErrors = 0;
            const summary = { totalQuestion: 0, recordSuccess: 0, recordErrors: 0 };

            const practiceSet = await this.populatePracticeSet(practiceData);
            this.validatePracticeSet(practiceSet, errors, settings, options, req, recordErrors);

            if (errors.length === 0 && sheetTwo) {
                const questionData = await this.parseExcelSheet(file, 1);
                practiceSet.questions = await this.validateQuestions(questionData, practiceSet, req, options, hasErrors, errors, recordSuccess, recordErrors);
                practiceSet.totalQuestion = practiceSet.questions.length;
            }

            summary.totalQuestion = practiceSet.totalQuestion;
            summary.recordSuccess = recordSuccess;
            summary.recordErrors = recordErrors;

            await fsExtra.remove(newFile);

            if (errors.length > 0) {
                practiceSet.summary = summary;
                practiceSet.errors = errors;
                throw new BadRequestException({
                    message: 'Errors upload',
                    errors: errors,
                    successes: [],
                    summary: summary,
                });
            } else {
                this.handleDirPath(practiceSet, options);
                return practiceSet;
            }
        }
    }

    async storePracticeSetData(req: any, data: any): Promise<any> {
        const user = req.user;
        const settings: any = await this.redisCache.getSettingAsync(req.instanceKey);

        let description = this.replaceAll(true, data.description, '_x000b_', ' ');
        description = this.replaceAll(true, description, '_x000d_', '');

        const practiceSet: any = {
            user: new Types.ObjectId(user._id),
            title: data.title,
            description: description,
            subjects: data.subjects,
            units: data.units,
            totalQuestion: data.totalQuestion,
            enableMarks: true,
            isMarksLevel: true,
            expiresOn: null,
            createMode: 'webUpload',
            dirPath: data.dirPath,
            userInfo: {
                _id: new Types.ObjectId(user._id),
                name: user.name,
            },
            locations: [],
            origin: 'institute',
        };

        if (user.roles.include('publisher')) {
            practiceSet.origin = 'publisher';
        } else if (user.activeLocation) {
            const loc = await this.locationRepository.findOne({ _id: new Types.ObjectId(user.activeLocation) });
            if (loc.type === 'publisher') {
                practiceSet.origin = 'publisher';
            }
        }

        if (user.activeLocation) {
            practiceSet.locations.push(user.activeLocation);
        }

        if (data.enableMarks) {
            practiceSet.enableMarks = data.enableMarks;
        }
        practiceSet.isMarksLevel = data.isMarksLevel;
        if (data.isMarksLevel) {
            if (data.minusMark) {
                practiceSet.minusMark = data.minusMark;
            }
            if (data.plusMark) {
                practiceSet.plusMark = data.plusMark;
            }
        }
        if (data.instructions) {
            practiceSet.instructions = data.instructions;
        }

        if (data.totalTime) {
            practiceSet.totalTime = data.totalTime;
        }

        if (data.testCode) {
            practiceSet.testCode = data.testCode;
        }

        if (data.countryCode) {
            const fc = settings.countries.find(c => c.code === data.countryCode);
            if (fc) {
                practiceSet.countries = [{
                    code: fc.code,
                    name: fc.name,
                    currency: fc.currency,
                    price: 0,
                    marketPlacePrice: 0,
                    discountValue: 0,
                }];
            } else {
                return { params: 'country', message: "Invalid country code!" };
            }
        }

        const existingPracticeSet = await this.practiceSetRepository.findOne(
            { title: data.title, user: new Types.ObjectId(user._id) }
        );

        if (existingPracticeSet) {
            return { params: 'title', message: "Name of practice test is available. Please enter another name!" };
        } else {
            const createdPracticeSet = await this.practiceSetRepository.create(practiceSet);

            // Add subjects to user
            await this.usersRepository.updateOne(
                { _id: new Types.ObjectId(user._id) },
                { $addToSet: { subjects: { $each: createdPracticeSet.subjects.map(s => s._id) } } }
            );

            const createdTime = new Date();
            const practiceQuestions = [];

            const questionPromises = data.questions.map(async (question, idx) => {
                const prefferLanguage = ['English'];
                let errors = [];
                let questionTextArr = [];
                let answerExplainArr = [];
                const getExplanationText = question.answerExplain;
                const getQuestionText = question.questionText;
                const getpreferLanguage = getQuestionText.match(/[^{}]+(?=\})/g);
                const getpreferLanguage1 = getQuestionText.match(/\{([^}]+)\}/gm);
                const expLanguage1 = getExplanationText.match(/\{([^}]+)\}/gm);

                if (getpreferLanguage && getpreferLanguage.length > 0 && (getpreferLanguage[0] === 'Marathi' || getpreferLanguage[0].toLowerCase() === 'marathi')) {
                    prefferLanguage.push(getpreferLanguage[0]);
                    questionTextArr = getQuestionText.split(getpreferLanguage1[0]);
                    for (const answer of question.answers) {
                        const getAnswer = answer.answerText;
                        const isLanguage = getAnswer.match(/[^{}]+(?=\})/g);
                        const isLanguage1 = getAnswer.match(/\{([^}]+)\}/gm);
                        if (isLanguage && isLanguage.length > 0) {
                            answer.answerTextArray = getAnswer.split(isLanguage1[0]);
                        } else {
                            errors.push({ param: 'options', message: 'Add both languages in sheet `Questions` options.' });
                            return {
                                message: 'Errors upload',
                                errors: errors,
                                successes: []
                            };
                        }
                        if (getExplanationText.trim() !== '') {
                            if (expLanguage1 && expLanguage1.length > 0) {
                                answerExplainArr = getExplanationText.split(expLanguage1[0]);
                            } else {
                                errors.push({ param: 'options', message: 'Add both languages in sheet `Questions` answer explanation.' });
                                return {
                                    message: 'Errors upload',
                                    errors: errors,
                                    successes: []
                                };
                            }
                        }
                    }
                } else {
                    questionTextArr.push(getQuestionText);
                    answerExplainArr.push(getExplanationText);
                    for (const answer of question.answers) {
                        answer.answerTextArray = answer.answerText;
                    }
                }

                question.prefferedLanguage = prefferLanguage;
                question.questionTextArray = questionTextArr;
                question.answerExplainArr = answerExplainArr;
                question.createdAt = new Date(createdTime.getTime() + 100 * idx);

                // Add default order
                if (!question.order) {
                    question.order = idx + 1;
                }

                if (req.body.isAllowReuse) {
                    question.isAllowReuse = req.body.isAllowReuse;
                } else {
                    question.isAllowReuse = 'none';
                }

                question.tags = [];
                if (req.body.tags) {
                    question.tags = req.body.tags.split(',');
                }
                if (data.tags) {
                    const tempTags = data.tags.split(',');
                    const mergeTags = question.tags.concat(tempTags);
                    question.tags = [...new Set(mergeTags)];
                }

                const newQuestion: any = {
                    user: createdPracticeSet.user,
                    prefferedLanguage: prefferLanguage,
                    questionTextArray: questionTextArr,
                    practiceSets: [createdPracticeSet._id],
                    answerExplainArr: answerExplainArr,
                    userRole: req.user.roles[0],
                    subject: question.subject,
                    unit: question.unit,
                    topic: question.topic,
                    createdAt: question.createdAt,
                    questionType: question.questionType,
                    answerNumber: question.answerNumber,
                    questionHeader: question.questionHeader,
                    minusMark: question.minusMark,
                    plusMark: question.plusMark,
                    complexity: question.complexity,
                    tags: question.tags,
                    questionText: question.questionText,
                    answerExplain: question.answerExplain,
                    isAllowReuse: question.isAllowReuse,
                    answers: question.answers,
                    category: question.category,
                    hasUserInput: question.hasUserInput,
                    userInputDescription: question.userInputDescription,
                    hasArg: question.hasArg,
                    argumentDescription: question.argumentDescription,
                    coding: question.coding,
                    wordLimit: question.wordLimit,
                };

                if (canOnlySeeLocationContents(req.user.roles)) {
                    newQuestion.locations = [req.user.activeLocation]
                }

                const savedQuestion = await this.questionRepository.create(newQuestion);

                const pq = {
                    question: savedQuestion._id,
                    createdAt: savedQuestion.createdAt,
                    section: savedQuestion.subject.name,
                    order: question.order,
                };

                practiceQuestions.push(pq);
            });

            await Promise.all(questionPromises);

            // Remove null values if any
            const arr = _.compact(practiceQuestions);
            await this.practiceSetRepository.updateOne(
                { _id: createdPracticeSet._id },
                { $push: { questions: { $each: arr, $sort: { createdAt: 1 } } } }
            );

            return createdPracticeSet;
        }
    }

    private async populatePracticeSet(data: any): Promise<any> {
        const practiceSet = {
            title: data[0][0],
            description: data[0][1],
            subjects: [],
            units: [],
            questions: [],
        };
        return practiceSet;
    }

    private validatePracticeSet(practiceSet: any, errors: any[], settings: any, options: any, req: any, recordErrors: number): void {
        if (!practiceSet.title) {
            errors.push({ param: 'title', message: 'Name of practice is required in sheet practice' });
            recordErrors++;
        } else if (practiceSet.title.length > 100) {
            errors.push({ param: 'title', message: 'Name of practice must be smaller than 100 characters in sheet practice' });
            recordErrors++;
        }
        if (practiceSet.description && practiceSet.description.length > 4000) {
            errors.push({ param: 'description', message: 'Practice Test Description must be smaller than 4000 characters in sheet practice' });
            recordErrors++;
        }
        if (practiceSet.instructions && practiceSet.instructions.length > 4000) {
            errors.push({ param: 'instructions', message: 'Practice Test Instructions must be smaller than 4000 characters in sheet practice' });
            recordErrors++;
        }
        if (practiceSet.totalTime && (isNaN(parseInt(practiceSet.totalTime)) || practiceSet.totalTime < 5)) {
            errors.push({ param: 'totalTime', message: 'Time must be an integer greater than or equal to 5 at Time Allocated in sheet practice' });
            recordErrors++;
        }
        practiceSet.title = practiceSet.title.replace(/ {1,}/g, ' ');
        practiceSet.plusMark = practiceSet.plusMark === undefined ? 0 : practiceSet.plusMark;
        practiceSet.minusMark = practiceSet.minusMark === undefined ? 0 : practiceSet.minusMark;

        if (practiceSet.isMarksLevel === undefined) {
            practiceSet.isMarksLevel = true;
            if (!practiceSet.minusMark && !practiceSet.plusMark) {
                practiceSet.isMarksLevel = false;
            }
        } else {
            practiceSet.isMarksLevel = practiceSet.isMarksLevel === '1';
        }

        if (practiceSet.isMarksLevel) {
            if (isNaN(parseFloat(practiceSet.plusMark)) || practiceSet.plusMark < 0) {
                errors.push({ param: 'plusMark', message: `Positive marks must be greater than or equal to zero in sheet practice` });
                recordErrors++;
            }
            if (isNaN(parseFloat(practiceSet.minusMark)) || practiceSet.minusMark > 0) {
                errors.push({ param: 'minusMark', message: `Negative marks must be less than or equal to zero in sheet practice` });
                recordErrors++;
            }
        }

        if (!practiceSet.countryCode) {
            errors.push({ param: 'countryCode', message: 'Country is required in sheet `Practice Test`, country must be ISO code A2' });
            recordErrors++;
        } else {
            const country = settings.countries.find(c => c.code === practiceSet.countryCode);
            if (!country) {
                errors.push({ param: 'countryCode', message: 'Invalid country code in sheet `Practice Test`' });
                recordErrors++;
            }
        }

        if (options.user && practiceSet.title) {
            const userFilter = { title: practiceSet.title.trim() };
            if (!settings.isWhiteLabelled) {
                userFilter['user'] = options.user._id;
            }

            // Assuming you have a practiceSetRepository
            const existingPracticeSet = this.practiceSetRepository.findOne(userFilter);
            if (existingPracticeSet) {
                errors.push({ param: 'title', message: 'Name of practice is duplicated with existing one in sheet `Practice Test`, please change the name.' });
                recordErrors++;
            }
        }
    }

    private async validateQuestions(data: any[], practiceSet: any, req: any, options: any, hasErrors: any, errors: any[], recordSuccess: number, recordErrors: number): Promise<any[]> {
        const questions = [];
        for (const [index, question] of data.entries()) {
            const row = index + 1;
            const result = await this.validateQuestion(question, row, practiceSet, req, options, hasErrors, errors);
            if (result.isSuccess) {
                recordSuccess++;
            } else {
                recordErrors++;
            }
            questions.push(result.question);
        }
        return questions;
    }

    private async validateQuestion(question: any, row: number, practiceSet: any, req: any, options: any, hasErrors: any, errors: any[]): Promise<any> {
        let isSuccess = true;
        const subjectName = question[0];
        const unitName = question[1];
        const topicName = question[2];
        const complexity = question[3] ? question[3].toLowerCase().trim() : '';
        const questionText = question[7] || '';
        const questionHeader = question[4] || '';
        const answerExplain = question[14] || '';
        const category = question[15] || 'mcq';

        const result = {
            questionType: 'single',
            answers: [],
            answerNumber: 0,
            subject: null,
            unit: null,
            topic: null,
            complexity,
            questionText,
            questionHeader,
            answerExplain,
            category,
            wordLimit: question[21] || 1,
            order: question[22] || row,
            hasUserInput: question[16] === '1',
            userInputDescription: question[17] || '',
            hasArg: question[18] === '1',
            argumentDescription: question[19] || '',
            coding: question[20] ? JSON.parse(question[20]) : [],
        };

        if (!subjectName) {
            errors.push({ param: 'subject', message: `[B:${row}] Subject is required in sheet \`Questions\`` });
            hasErrors.sheet2.subject = true;
            isSuccess = false;
        } else {
            const subject = await this.findSubject(req, subjectName, row);
            if (!subject) {
                errors.push({ param: 'subject', message: `[B:${row}] Subject \`${subjectName}\` not found in sheet \`Questions\`` });
                hasErrors.sheet2.subject = true;
                isSuccess = false;
            } else {
                result.subject = { _id: subject._id, name: subject.name };
            }
        }

        if (!unitName) {
            errors.push({ param: 'unit', message: `[C:${row}] Unit is required in sheet \`Questions\`` });
            hasErrors.sheet2.unit = true;
            isSuccess = false;
        } else if (!result.subject) {
            errors.push({ param: 'unit', message: `[C:${row}] Unit requires subject in sheet \`Questions\`` });
            hasErrors.sheet2.unit = true;
            isSuccess = false;
        } else {
            const unit = await this.getUnit(req, result.subject, unitName, row);
            if (!unit) {
                errors.push({ param: 'unit', message: `[C: ${row}]Unit \`${unitName}\` not found in sheet \`Questions\`` });
                hasErrors.sheet2.unit = true;
                isSuccess = false;
            } else {
                result.unit = { _id: unit._id, name: unit.name };
            }
        }

        if (!topicName) {
            errors.push({ param: 'topic', message: `[D: ${row}]Topic is required in sheet \`Questions\`` });
            hasErrors.sheet2.topic = true;
            isSuccess = false;
        } else if (!result.unit) {
            errors.push({ param: 'topic', message: `[D: ${row}]Topic requires unit in sheet \`Questions\`` });
            hasErrors.sheet2.topic = true;
            isSuccess = false;
        } else {
            const topic = await this.getTopic(req, result.unit, topicName, row);
            if (!topic) {
                errors.push({ param: 'topic', message: `[D: ${row}]Topic \`${topicName}\` not found in sheet \`Questions\`` });
                hasErrors.sheet2.topic = true;
                isSuccess = false;
            } else {
                result.topic = { _id: topic._id, name: topic.name };
            }
        }

        if (!complexity || ['easy', 'moderate', 'hard'].indexOf(complexity) === -1) {
            errors.push({ param: 'complexity', message: `[E: ${row}]Complexity is required and must be one of easy, moderate, hard in sheet \`Questions\`` });
            hasErrors.sheet2.complexity = true;
            isSuccess = false;
        }

        if (!questionText) {
            errors.push({ param: 'questionText', message: `[F: ${row}]Question text is required in sheet \`Questions\`` });
            hasErrors.sheet2.questionText = true;
            isSuccess = false;
        }

        const answerOptions = question[13] ? question[13].split(',') : [];
        if (answerOptions.length > 1) {
            result.questionType = 'multiple';
        }

        for (let i = 8; i <= 12; i++) {
            const answerText = question[i] ? question[i].toString() : '';
            if (answerText) {
                result.answers.push({
                    answerText,
                    isCorrectAnswer: answerOptions.includes((i - 7).toString()),
                });
            }
        }

        if (result.category === 'mcq' && result.answers.length < 2) {
            errors.push({ param: 'answers', message: `[G: ${row}]MCQ questions must have at least 2 answers in sheet \`Questions\`` });
            hasErrors.sheet2.answers = true;
            isSuccess = false;
        }

        if (result.category === 'fib') {
            const answers = [];
            const regex = /\{{([^}]+)\}}/mg;
            let match;
            while ((match = regex.exec(result.questionText)) !== null) {
                answers.push({
                    answerText: match[1],
                    isCorrectAnswer: true,
                });
            }
            result.answers = answers;
        }

        return { isSuccess, question: result };
    }

    private handleDirPath(practiceSet: any, options: any): void {
        if (options.uniqTestFolderName) {
            practiceSet.dirPath = options.dirPath.endsWith(options.user._id.toString())
                ? path.join(options.dirPath, options.uniqTestFolderName)
                : path.join(path.dirname(options.dirPath), options.uniqTestFolderName);
            practiceSet.testCode = options.uniqTestFolderName;
        } else {
            practiceSet.dirPath = options.dirPath;
        }
    }

    private async findSubject(req: any, subjectName: string, row: number): Promise<any> {
        const filterSubject = this.regexName(subjectName);
        const subject = await this.subjectRepository.findOne({ name: filterSubject });
        if (!subject) {
            throw new BadRequestException([{ params: 'subject', message: "[A:" + row + "] Subject `" + name + "` is not avaliable in sheet `Questions`" }]);
        }

        return subject;
    }

    private async getUnit(req: any, subject: any, unitName: string, row: number): Promise<any> {
        const filterName = this.regexName(unitName);

        const unit = await this.unitRepository.findOne(
            { subject: subject._id, name: filterName, $or: [{ "active": { $exists: false } }, { "active": true }] }
        )
        if (!unit) {
            throw new BadRequestException([{ params: 'Unit', 'message': "[C:" + row + "] Unit `" + unitName + "` of subject `" + subject.name + "` is inactive or not available in database" }]);
        }

        return unit;
    }

    async importExcelFileByObject(file: any, uploadDir: string, uniqTestFolderName: string, req: any): Promise<any> {
        const fileName = file.filename;
        const currentPath = file.path;
        const filePath = path.join(uploadDir, currentPath);

        // Ensure the directory exists
        await fsExtra.ensureDir(path.dirname(filePath));
        await fs.promises.rename(currentPath, filePath);

        const dirPath = path.join(path.dirname(uploadDir), path.dirname(currentPath));

        try {
            const data = await this.parseXlsx(req, filePath, {
                user: req.user,
                uniqTestFolderName,
                dirPath,
            });

            const uploadData: any = { ...data };
            delete uploadData.summary;
            delete uploadData.errors;

            const savedTest = await this.storePracticeSetData(req, uploadData);

            return savedTest;
        } catch (err) {
            err.fileName = fileName;
            await this.sendErrorsUpload(req, err, req.user);
            throw err;
        }
    }

    private async ensureDirectories(paths: string[]): Promise<void> {
        for (const soucePath of paths) {
            try {
                await fs.promises.access(soucePath, fs.constants.R_OK);
            } catch (err) {
                await fs.promises.mkdir(soucePath, { recursive: true });
            }
        }
    }

    private async cleanupDirectory(directory: string): Promise<void> {
        try {
            await fs.promises.access(directory, fs.constants.R_OK);
            await fsExtra.remove(directory);
            Logger.debug('uploadTemp removed');
        } catch (err) {
            Logger.error(err);
        }
    }
    //Internal Functions - end



    //Main Exported Fucntions - start
    async importQuestionExcelFile(req: any): Promise<any> {
        const file = req.file;
        const fileName = file.originalname;
        const buffer = file.buffer;

        try {           
            const data = await this.parseQuestionXlsx(req, buffer, { user: req.user });

            const uploadData: any = { ...data };
            delete uploadData.summary;
            delete uploadData.errors;

            await this.storeQuestionData(req, uploadData);

            return { message: 'ok' };
        } catch (err) {
            Logger.error(err.message);
            err['fileName'] = fileName;
            await this.sendErrorsUpload(req, err, req.user);
            throw new GrpcInternalException(err.message);
        }
    }

    async importQZipFile(req: any): Promise<any> {
        const { file } = req;
        const uploadedFile = file.buffer; // Assuming file is received as a buffer

        // Check if file exists and its type
        if (!uploadedFile || uploadedFile.length === 0) {
            throw new BadRequestException('No file uploaded');
        }

        const allowFileType = ['.xls', '.xlsx'];
        const allowFileExtract = ['.png', '.jpg', '.gif', '.jpeg'];
        const uploadPath = getAssets(req.instancekey);
        const defaultPath = path.join(getAssets(req.instancekey), 'uploads/files');

        // Create a unique folder name
        const uniqTestFolderName = getUniqueCode(6);

        // Save buffer to a temporary file for DecompressZip to work
        const tempZipPath = path.join(uploadPath, `${Date.now()}_${file.originalname}`);
        await fs.promises.writeFile(tempZipPath, uploadedFile);

        const tempZipper = new DecompressZip(tempZipPath);
        let uploadFileXls: any = null;
        let numberFileXls = 0;

        return new Promise((resolve, reject) => {
            tempZipper.on('error', (err) => {
                fs.promises.unlink(tempZipPath).catch(Logger.error);
                return reject(new BadRequestException('Error extracting zip file'));
            });

            tempZipper.on('extract', async (log) => {
                fs.promises.unlink(tempZipPath).catch(Logger.error);

                if (uploadFileXls != null && numberFileXls === 1) {
                    try {
                        const result = await this.importQuestionExcelFileByObject(uploadFileXls, uploadPath, uniqTestFolderName, req);

                        await fsExtra.remove(uploadPath);

                        const FileZipper = new DecompressZip(uploadedFile);
                        let dirPath = result.dirPath;

                        FileZipper.on('extract', () => {
                            Logger.debug('Finished extracting');

                            FileZipper.on('list', async (files) => {
                                Logger.debug('The archive contains:');
                                Logger.debug(files);
                                const awsPath = dirPath.replace(/\\/g, '/').replace('assets/', '');

                                for (const f of files) {
                                    const ext = path.extname(f);
                                    if (allowFileExtract.includes(ext)) {
                                        try {
                                            const filePath = path.join(dirPath, f);
                                            const fileBuffer = await fs.promises.readFile(filePath);
                                            const mockFile = {
                                                fieldname: 'file',
                                                originalname: f,
                                                encoding: '7bit',
                                                mimetype: `image/${ext.replace('.', '')}`,
                                                size: fileBuffer.length,
                                                stream: fs.createReadStream(filePath),
                                                destination: '',
                                                filename: f,
                                                path: filePath,
                                                buffer: fileBuffer
                                            };
                                            await this.s3Service.userAssetUpload(mockFile, `${awsPath}/${f}`);
                                        } catch (err) {
                                            Logger.error(err);
                                        }
                                    }
                                }
                            });

                            FileZipper.list();
                        });

                        // Extract images to the directory
                        FileZipper.extract({
                            path: dirPath,
                            strip: 1, // Remove leading folder in the path, in this case it is folder contains excel file and images
                            filter: (file) => {
                                const ext = path.extname(file.filename).toLowerCase();
                                return file.type !== 'SymbolicLink' && allowFileExtract.includes(ext);
                            }
                        });

                        // Optionally notify user
                        if (req.body && req.body.notifyUser) {
                            await this.notificationRepository.create({
                                receiver: new Types.ObjectId(req.user._id),
                                type: 'notification',
                                modelId: 'upload',
                                subject: 'Questions are uploaded successfully!'
                            })
                        }

                        resolve({ response: 'ok' });
                    } catch (err) {
                        await fsExtra.remove(uploadPath);
                        reject(new BadRequestException('Error processing excel file'));
                    }
                } else {
                    await fsExtra.remove(uploadPath);
                    reject(new BadRequestException('Your zip file should contain only one spreadsheet.'));
                }
            });

            // Filter files during extraction
            tempZipper.extract({
                path: uploadPath,
                filter: (file) => {
                    const ext = path.extname(file.filename);
                    if (_.indexOf(allowFileType, ext) !== -1 && file.type !== 'SymbolicLink') {
                        uploadFileXls = file;
                        numberFileXls++;
                        return true;
                    }
                    return false;
                },
            });
        });
    }

    async importOnlyExcelFile(req: any): Promise<any> {
        const { file } = req;
        const fileName = file.originalname;
        const filePath = path.join(getAssets(req.instancekey), fileName);

        // Ensure the file is saved to the server
        await fs.promises.writeFile(filePath, file.buffer);

        try {
            const data = await this.parseXlsx(req, filePath, { user: req.user });

            const uploadData = { ...data };
            delete uploadData.summary;
            delete uploadData.errors;

            await this.storePracticeSetData(req, uploadData);

            // Clean up the file after processing
            await fs.promises.unlink(filePath);

            return { message: 'OK' };
        } catch (err) {
            err.fileName = fileName;
            this.sendErrorsUpload(req, err, req.user);
            throw new BadRequestException('Error processing Excel file');
        }
    }

    async sendToExtractService(req: any): Promise<any> {
        const file = req.file; // Assuming the file is attached to the request
        const filePath = path.join(__dirname, file.path); // Update the path according to your setup

        const formData = new FormData();
        formData.append('my_field', 'file');
        formData.append('my_file', fs.createReadStream(filePath), file.originalname);
        formData.append('owner', req.user._id.toString());
        formData.append('roles', req.user.roles[0]);
        formData.append('location', req.user.activeLocation.toString());

        if (req.body.tags) {
            formData.append('tags', req.body.tags);
        }

        if (req.body.overwritten) {
            formData.append('overwritten', req.body.overwritten);
        }

        if (req.body.isAllowReuse) {
            formData.append('isAllowReuse', req.body.isAllowReuse);
        }

        try {
            const response: any = await firstValueFrom(
                this.httpService.post(`${config.reportApi}testImport`, formData, {
                    headers: {
                        'instanceKey': req.headers.instanceKey,
                        ...formData.getHeaders()
                    }
                }).pipe(
                    catchError((error) => {
                        Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
                        throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data)}`);
                    })
                )
            );

            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                const errorDetail = response.data;
                await this.sendErrorsUpload(req, {
                    fileName: file.originalname,
                    errors: [errorDetail]
                }, req.user);

                throw new BadRequestException(errorDetail);
            }
        } catch (error) {
            Logger.error(error);
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.getResponse());
            }
            if (error.response && error.response.status === 400) {
                const errorDetail = error.response.data;
                await this.sendErrorsUpload(req, {
                    fileName: file.originalname,
                    errors: [errorDetail]
                }, req.user);

                throw new GrpcInvalidArgumentException(errorDetail);
            }

            throw new GrpcInternalException('Error processing the request');
        }
    }

    async importZipFile(req: any): Promise<any> {
        const { file } = req;
        const uploadedFile = file.buffer; // Assuming file is received as a buffer

        // Check if file exists and its type
        if (!uploadedFile || uploadedFile.length === 0) {
            throw new BadRequestException('No file uploaded');
        }

        const allowFileType = ['.xls', '.xlsx'];
        const allowFileExtract = ['.png', '.jpg', '.gif', '.jpeg'];
        const uploadPath = getAssets(req.instancekey);
        const defaultPath = `${uploadPath}/uploads/files`;
        const uploadImageDir = path.join(uploadPath, 'uploads/image');
        const now = new Date();
        const uploadDir = path.join(uploadImageDir, req.user._id.toString());
        const uploadTemp = path.join(uploadDir, 'tmp' + now.getTime());

        // Create a unique folder name
        const uniqTestFolderName = getUniqueCode(6);

        await this.ensureDirectories([defaultPath, uploadImageDir, uploadDir, uploadTemp]);

        const tempZipper = new DecompressZip(uploadedFile);
        const FileZipper = new DecompressZip(uploadedFile);
        let uploadFileXls = null;
        let numberFileXls = 0;

        return new Promise((resolve, reject) => {
            tempZipper.on('error', (err) => {
                reject(new BadRequestException('Error extracting zip file'));
            });

            tempZipper.on('extract', async (log) => {
                if (uploadFileXls != null && numberFileXls === 1) {
                    try {
                        const savedTest = await this.importExcelFileByObject(uploadFileXls, uploadTemp, uniqTestFolderName, req);

                        await this.cleanupDirectory(uploadTemp);

                        FileZipper.on('extract', () => {
                            Logger.debug('Finished extracting');

                            FileZipper.on('list', async (files) => {
                                Logger.debug('The archive contains:');
                                Logger.debug(files);
                                const awsPath = savedTest.dirPath.replace(/\\/g, '/').replace('assets/', '');

                                for (const f of files) {
                                    const ext = path.extname(f).toLowerCase();
                                    if (allowFileExtract.includes(ext)) {
                                        const filePath = path.join(savedTest.dirPath, f);
                                        const fileBuffer = await fs.promises.readFile(filePath);
                                        const mockFile: any = {
                                            buffer: fileBuffer,
                                            originalname: f,
                                            mimetype: `image/${ext.replace('.', '')}`,
                                            fieldname: 'file',
                                            encoding: '7bit',
                                            size: fileBuffer.length,
                                            stream: fs.createReadStream(filePath),
                                        };
                                        await this.s3Service.userAssetUpload(mockFile, `${awsPath}/${f}`);
                                    }
                                }
                            });

                            FileZipper.list();
                        });

                        // When all are fine, we extract images now.
                        FileZipper.extract({
                            path: savedTest.dirPath,
                            strip: 1, // Remove leading folder in the path, in this case it is folder contains excel file and images
                            filter: (file: any) => {
                                const ext = path.extname(file.filename).toLowerCase();
                                return file.type !== 'SymbolicLink' && allowFileExtract.includes(ext);
                            },
                        });

                        if (req.body && req.body.notifyUser) {
                            await this.notificationRepository.create({
                                receiver: new Types.ObjectId(req.user._id as string),
                                type: 'notification',
                                modelId: 'upload',
                                subject: 'PracticeSet is uploaded successfully!'
                            })
                        }
                        resolve({ message: 'ok' });
                    } catch (err) {
                        await this.cleanupDirectory(uploadTemp);
                        reject(new BadRequestException('Error processing excel file'));
                    }
                } else {
                    await this.cleanupDirectory(uploadTemp);
                    reject(new BadRequestException('Your zip file should contain only one spreadsheet.'));
                }
            });

            // Filter files during extraction
            tempZipper.extract({
                path: uploadTemp,
                filter: (file: any) => {
                    const ext = path.extname(file.filename);
                    if (allowFileType.includes(ext) && file.type !== 'SymbolicLink') {
                        uploadFileXls = file;
                        numberFileXls++;
                        return true;
                    }
                    return false;
                },
            });
        });
    }
}
