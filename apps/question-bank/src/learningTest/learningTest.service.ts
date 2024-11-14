import { QuestionRepository, AttemptDetailRepository, AttemptRepository, PracticeSetRepository, SubjectRepository, UnitRepository, AttendanceRepository, RedisCaching, TestSeriesRepository, UsersRepository, UserCourseRepository, ClassroomRepository, Constants, AttemptDetail, CourseRepository } from '@app/common';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotAcceptableException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import * as util from '@app/common/Utils';
import { ObjectId } from 'mongodb';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { GetNextQuestionLearningTestRequest, GetPracticeSetRequest } from '@app/common/dto/question-bank.dto';
import { codingAnswerCompare, fibAnswerCompare, mixmatchAnswerCompare } from '@app/common/helpers/attempt';
import * as _ from 'lodash';
@Injectable()
export class LearningTestService {
    constructor(private readonly questionRepository: QuestionRepository,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly testSeriesRepository: TestSeriesRepository,
        private readonly usersRepository: UsersRepository,
        private readonly userCourseRepository: UserCourseRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly redisCache: RedisCaching,
        private readonly attemptProcessor: AttemptProcessor,
        private readonly courseRepository: CourseRepository,
    ) { }

    removeAD(doc) {
        if (doc.attemptdetails)
            if (doc.attemptdetails.QA) {
                var QA = doc.attemptdetails.QA.slice()
                if (!(Object.keys(doc).indexOf('_id') + 1)) {
                    doc = doc.toObject()
                }
                doc.QA = QA
                doc.attemptdetails = doc.attemptdetails._id
            } else {
                doc.QA = [];
            }
        return doc
    }

    removeAttemptDetails(docs) {
        if (Array.isArray(docs)) {
            for (var i = 0; i < docs.length; i++) {
                docs[i] = this.removeAD(docs[i])
            }
        } else {
            docs = this.removeAD(docs)
        }

        return docs
    }

    private async filterCodeLanguages(req: any, practice, question) {
        try {
            if (question.category != 'code') {
                return;
            }
            let enableLang = practice.enabledCodeLang;
            if (practice.testseries && practice.testseries.length > 0 || req.query.packageId) {
                let query: any = { status: 'published', practiceIds: practice._id }
                if (req.query.packageId) {
                    query._id = new ObjectId(req.query.packageId)
                } else {
                    query._id = practice.testseries
                }
                // get enable lang from pack
                this.testSeriesRepository.setInstanceKey(req.instancekey);
                let pac = await this.testSeriesRepository.findOne(query, { enabledCodeLang: 1 }, { lean: true });
                if (pac && pac.enabledCodeLang && pac.enabledCodeLang[0]) {
                    enableLang = pac.enabledCodeLang
                }
            }

            if (enableLang && enableLang[0]) {
                practice.questions.forEach(question => {
                    if (question.category == 'code') {
                        question.coding = question.coding.filter(c => enableLang.indexOf(c.language) > -1);
                    }
                })
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private async sortQuestions(req: any, test, isRefresh, attemptId?) {
        let questionOrder: any = isRefresh ? null : (await this.redisCache.getAsync(req.instancekey, `${req.user._id.toString()}_learning_question_order_${test._id.toString()}`))
        if (questionOrder) {
            let sortedQuestions = []
            questionOrder.forEach(qo => {
                let fq = test.questions.find(q => q.question.equals(qo));
                sortedQuestions.push(fq)
            })
            test.questions = sortedQuestions;
        } else {
            if (test.randomQuestions) {
                let questionsToSort = test.questions
                let sortedQuestions = []
                if (!isRefresh) {
                    this.attemptDetailRepository.setInstanceKey(req.instancekey);
                    let details = await this.attemptDetailRepository.findOne({ attempt: attemptId }, null, { lean: true });

                    // make sure already answers questions are not shuffled
                    if (details && details.QA.length) {
                        details.QA.forEach(qa => {
                            let fq = test.questions.find(q => q.question.equals(qa.question))
                            if (fq) {
                                sortedQuestions.push(fq);
                            }
                        })
                        questionsToSort = [];

                        test.questions.forEach(q => {
                            let fq = sortedQuestions.find(qa => qa.question.equals(q.question));
                            if (!fq) {
                                questionsToSort.push(q)
                            }
                        })
                    }
                }

                test.questions = sortedQuestions.concat(util.shuffleArray(questionsToSort))
            } else {
                // sort questions by
                test.questions.sort(function (q1, q2) {
                    if (q1.order < q2.order) {
                        return -1;
                    } else if (q1.order > q2.order) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }
            let questionList = test.questions.map(q => q.question);
            this.redisCache.set(req, `${req.user._id.toString()}_learning_question_order_${test._id.toString()}`, questionList, 60 * 60 * 24)
        }
    }

    private async sortAnswers(test, question) {
        if (test.randomizeAnswerOptions && question.category == 'mcq') {
            question.answers = util.shuffleArray(question.answers);
        }
    }

    private async createAttempt(req: GetPracticeSetRequest, practiceSet, question, isFirstAttempt) {
        try {
            let attClasses = []
            if (practiceSet.classRooms && practiceSet.classRooms.length) {
                this.classroomRepository.setInstanceKey(req.instancekey);
                attClasses = await this.classroomRepository.distinct('_id',
                    {
                        _id: { $in: practiceSet.classRooms },
                        'students.studentId': new ObjectId(req.user._id as string),
                        location: new ObjectId(req.user.activeLocation as string)
                    })
            }
            var attemptData: any = {}
            attemptData.user = new ObjectId(req.user._id as string);
            attemptData.studentName = req.user.name;
            attemptData.isAbandoned = false;
            attemptData.practicesetId = practiceSet._id
            attemptData.isShowAttempt = practiceSet.isShowAttempt
            attemptData.partiallyAttempted = true;
            attemptData.practiceSetInfo = {
                title: practiceSet.title,
                titleLower: practiceSet.titleLower,
                subjects: practiceSet.subjects,
                units: practiceSet.units,
                createdBy: practiceSet.user,
                accessMode: practiceSet.accessMode,
                classRooms: attClasses,
                isAdaptive: false,
            }

            attemptData.createdBy = {
                user: practiceSet.user._id,
                name: practiceSet.user.name
            }

            if (practiceSet.level != undefined) {
                attemptData.practiceSetInfo.level = practiceSet.level
            }
            attemptData.totalQuestions = 0
            attemptData.email = req.user.email
            attemptData.location = new ObjectId(req.user.activeLocation as string)
            attemptData.QA = []

            // Add subjects here
            attemptData.subjects = []

            if (req.query.referenceType && req.query.referenceId) {
                attemptData.referenceId = new ObjectId(req.query.referenceId as string);
                attemptData.referenceType = req.query.referenceType;

                if (req.query.referenceData) {
                    attemptData.referenceData = new ObjectId(req.query.referenceData)
                }
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            var newAttempt = await this.attemptRepository.create(attemptData)

            req.query.attempt = newAttempt._id;
            var attemptDetailsObj = {
                attempt: newAttempt._id,
                practicesetId: practiceSet._id,
                isAbandoned: false,
                QA: [],
                user: new ObjectId(req.user._id as string)
            }
            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            var attemptdetails = await this.attemptDetailRepository.create(attemptDetailsObj)

            if (isFirstAttempt) {
                this.attemptRepository.setInstanceKey(req.instancekey);
                let attemptCount: any = await this.attemptRepository.aggregate([
                    { $match: { practicesetId: attemptDetailsObj.practicesetId } },
                    { $project: { user: 1, practicesetId: 1 } },
                    { $group: { _id: "$user" } },
                    { $group: { _id: null, count: { $sum: 1 } } }
                ])

                let count = attemptCount.length ? attemptCount[0].count : 0;

                this.practiceSetRepository.setInstanceKey(req.instancekey);
                await this.practiceSetRepository.updateOne({
                    _id: attemptDetailsObj.practicesetId
                }, {
                    totalJoinedStudent: count
                })

                this.usersRepository.setInstanceKey(req.instancekey);
                await this.usersRepository.updateOne({ _id: new ObjectId(req.user._id as string) }, { $addToSet: { practiceViews: attemptDetailsObj.practicesetId } })
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            await this.attemptRepository.updateOne({
                _id: newAttempt._id
            }, {
                $set: {
                    attemptdetails: attemptdetails._id
                }
            })

            await this.filterCodeLanguages(req, practiceSet, question)
            await this.sortAnswers(practiceSet, question)

            // Update quiz content with attemptId
            if (req.query.referenceType == 'course' && req.query.referenceId && req.query.referenceData) {
                await this.userCourseRepository.updateOne(
                    { user: new ObjectId(req.user._id as string), course: new ObjectId(req.query.referenceId), 'contents._id': new ObjectId(req.query.referenceData) },
                    { $set: { 'contents.$.attempt': newAttempt._id } })
            }

            return { 'practice': practiceSet, attemptDetailId: attemptdetails._id, question: question, attempt: req.query.attempt, currPage: 1 }
        } catch (err) {
            Logger.error(err);
            throw new InternalServerErrorException(err.message);
        }
    }
    // The practice set along with creater of that practice set.
    async getPracticeSet(req: GetPracticeSetRequest) {
        try {
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let practiceSet = await this.practiceSetRepository.findOne({ _id: req.id }, null,
                { populate: { path: 'user', select: '_id name avatar' }, lean: true });

            if (!practiceSet) {
                throw new NotFoundException();
            }

            this.attemptRepository.setInstanceKey(req.instancekey)
            let results = await this.attemptRepository
                .find({ user: new ObjectId(req.user._id), practicesetId: new ObjectId(req.id) }, null, { sort: { updatedAt: -1.0 }, lean: true })

            if (results.length > 0) {
                await this.attemptRepository.updateOne({ _id: results[0]._id }, { $inc: { resumeCount: 1 } })
                if ((practiceSet.totalQuestion - 1) > results[0].lastIndex && results[0].subjects.length > 0) {
                    await this.sortQuestions(req, practiceSet, false, results[0]._id);
                    this.questionRepository.setInstanceKey(req.instancekey)
                    let response = await this.questionRepository.findOne({ _id: practiceSet.questions[results[0].lastIndex + 1].question }, null, { lean: true })

                    await this.filterCodeLanguages(req, practiceSet, response)
                    await this.sortAnswers(practiceSet, response)
                    return { practice: practiceSet, question: response, attemptDetailId: results[0].attemptdetails, attempt: results[0]._id, currPage: results[0].lastIndex + 2 }
                } else {
                    await this.sortQuestions(req, practiceSet, results[0].subjects.length !== 0, results[0]._id)
                    this.questionRepository.setInstanceKey(req.instancekey)
                    let question = await this.questionRepository.findOne({ _id: practiceSet.questions[0].question }, null, { lean: true })

                    req.query.practiceset = practiceSet._id
                    if (results[0].subjects.length !== 0) {
                        const res = await this.createAttempt(req, practiceSet, question, false)

                        return res;
                    } else {
                        await this.filterCodeLanguages(req, practiceSet, question)

                        await this.sortAnswers(practiceSet, question)
                        const res = { practice: practiceSet, question: question, attemptDetailId: results[0].attemptdetails, attempt: results[0]._id, currPage: 1 };

                        return res;
                    }
                }

            } else {
                await this.sortQuestions(req, practiceSet, true);
                this.questionRepository.setInstanceKey(req.instancekey);
                let response = await this.questionRepository.findOne({ _id: practiceSet.questions[0].question }, null, { lean: true })

                req.query.practiceset = practiceSet._id
                const res = await this.createAttempt(req, practiceSet, response, true)

                return res;

            }
        } catch (ex) {
            Logger.error(ex);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async updateSectionAnalytics(ik, section, userCourse) {
        let quiz = 0;
        let quizCompleted = 0;
        let test = 0;
        let testAtm = 0;
        let attemptC = 0;
        let mark = 0;
        let maxMark = 0;
        let attemptAccuracy = 0;

        for (let content of section.contents) {
            if (content.type == "quiz" || content.type == "assessment") {
                quiz += content.type == "quiz" ? 1 : 0;
                test += content.type == "assessment" ? 1 : 0;

                let attContent = userCourse.contents.find((c) =>
                    c._is.equals(content._id));
                if (attContent) {
                    if (!!attContent.attempt) {
                        attemptC++;
                        testAtm += content.type == "assessment" ? 1 : 0;
                        this.attemptRepository.setInstanceKey(ik)
                        let attempt = await this.attemptRepository.findById(new ObjectId(attContent.attempt))
                        mark += attempt.totalMark;
                        maxMark += attempt.maximumMarks;
                        attemptAccuracy += attempt.maximumMarks != 0 ? attempt.totalMark / attempt.maximumMarks : 0;
                    }
                    quizCompleted += content.type == "quiz" && attContent.completed ? 1 : 0;
                }
            }
        }
        let userSec = userCourse.sections.find((sec) => sec._id.equals(section._id));
        if (!userSec) {
            userSec = {};
            userSec.analytics = {
                quiz: 0,
                test: 0,
                attemot: 0,
                accuracy: 0,
                mark: 0,
                maxMark: 0,
            }
        };

        userSec.analytics.quiz - quiz ? util.round((quizCompleted / quiz) * 100, 0, 100) : 0;
        userSec.analytics.test = test ? util.round((testAtm / test) * 100, 0, 100) : 0;
        userSec.analytics.attempt = quiz + test ? util.round((attemptC / (quiz + test)) * 100, 0, 100) : 0;
        userSec.analytics.accuracy = attemptC ? util.round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.accuracy = attemptC ? util.round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.accuracy = attemptC ? util.round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.mark = mark;
        userSec.analytics.maxMark = maxMark;
    }

    private async updateUserCourse(ik, userId, courseContent, attempt) {
        try {
            this.userCourseRepository.setInstanceKey(ik)
            let uc = await this.userCourseRepository.findOneAndUpdate(
                { user: userId, course: courseContent.course, 'contents._id': courseContent.content },
                {
                    $set: { 'contents.$.completed': true, 'contents.$.attempt': attempt._id, 'contents.$.end': new Date() },
                    $inc: { 'contents.$.timeSpent': attempt.totalTime }
                },
                { new: true })

            // Check if user has complete all
            if (uc) {
                let completedContents = uc.contents.filter(c => c.completed);
                this.courseRepository.setInstanceKey(ik)
                let course: any = await this.courseRepository.findById(uc.course, null, { lean: true });

                let finished = true;
                for (let sec of course.sections) {
                    for (let content of sec.contents) {
                        if (content.active) {
                            if (content._id.equals(courseContent.content)) {
                                await this.updateSectionAnalytics(ik, sec, uc)
                            }
                            let f = completedContents.findIndex(c => c._id.equals(content._id))
                            if (f == -1) {
                                finished = false;
                            }
                        }
                    }
                }

                if (finished) {
                    uc.completed = true;
                }
                await this.userCourseRepository.findByIdAndUpdate(uc._id, uc)
            }
        } catch (ex) {
            Logger.error('$o', ex)
        }
    }


    // it finds the detail of previous question
    private async previousQuestionDetail(req: GetNextQuestionLearningTestRequest, question, answers, answerOptionCount, userAnswers, userAnswerCount, correctAnswer) {
        if (req.query.question && req.query.attempt) {
            var questionId = new ObjectId(req.query.question)
            this.questionRepository.setInstanceKey(req.instancekey);
            const prevQuestion = await this.questionRepository.findOne({
                _id: questionId
            }, null, { lean: true });
            if (!prevQuestion) {
                throw new NotAcceptableException('Passed Question-ID is incorrect.');
            }
            question = prevQuestion;
            answers = prevQuestion.answers;
            answerOptionCount = answers.length;
            if (question.category == 'fib') {
                userAnswers.forEach(function (userAnswer) {
                    answers.forEach(function (actualAnswer) {
                        if (String(userAnswer.answerId) == String(actualAnswer._id)) {
                            if (fibAnswerCompare(actualAnswer, userAnswer)) {
                                userAnswerCount++;
                            }
                        }
                    })
                })

                if (userAnswerCount == answerOptionCount) {
                    correctAnswer = 1
                }
            } else if (question.category == 'code') {
                let hasWrongAnswer = false;
                let codeData = _.find(question.coding, {
                    language: userAnswers[0].codeLanguage
                });
                if (codeData) {
                    hasWrongAnswer = false;

                    // Check user testcases output to find correct answer
                    question.testcases.forEach(function (testcase) {
                        let userCase = _.find(userAnswers[0].testcases, utc => {
                            let isTheCase = true
                            if (question.hasArg) {
                                isTheCase = utc.args == testcase.args
                            }
                            if (isTheCase && question.hasUserInput) {
                                isTheCase = utc.input == testcase.input
                            }

                            return isTheCase;
                        });
                        if (userCase) {
                            if (!userCase.output || codingAnswerCompare(testcase.output, userCase.output)) {
                                userCase.status = false;
                                hasWrongAnswer = true;
                            } else {
                                userCase.status = true;
                            }
                        } else {
                            if (userAnswers[0].testcases) {
                                // Only log this if user has run the code but the testcases does not matched 
                                Logger.warn('userCase not found for question %s - language %s - testcase %j - user answer %j',
                                    question._id.toString(), userAnswers[0].codeLanguage, testcase, userAnswers[0])
                            }

                            hasWrongAnswer = true;
                        }
                    })
                } else {
                    // @ad-  userAnswerLookup[qid] was used here 
                    Logger.warn('codeData not found for question %s - language %s', question._id.toString())
                }
                if (!hasWrongAnswer) {
                    correctAnswer = 1
                }
            }
            else if (question.category == 'descriptive') {
                //  pending = pending + 1;
                // isEvaluated = false;
                // hasWrongAnswer = true;
            }
            else if (question.category == 'mcq') {
                let answerCorrect = [];
                for (let c in answers) {
                    if (answers[c].isCorrectAnswer) {
                        answerCorrect.push(answers[c]._id.toString());
                    }
                }

                var diff = _.difference(answerCorrect, userAnswers);

                if (diff.length == 0) {
                    correctAnswer = 1
                }

            } else if (question.category == 'mixmatch') {
                const match = []
                answers.forEach(function (actualAnswer, i) {
                    const index = userAnswers.findIndex(a => a.answerText == actualAnswer.answerText)
                    const correctMatch = mixmatchAnswerCompare(actualAnswer, userAnswers[index])
                    match.push(correctMatch);
                })
                if (!match.includes(false)) {
                    correctAnswer = 1
                }
            } else {
                throw new BadRequestException('Pass valid parameters.');
            }
            return {
                'isCorrect': correctAnswer,
                'prevQuestion': prevQuestion
            };

        } else {
            throw new BadRequestException('Pass Attempt-ID, Question-ID and Answer-IDs.');
        }
    }

    private async getPreviousResponseDetail(req: GetNextQuestionLearningTestRequest, response, resp, answerIDs) {
        var attemptID = new ObjectId(req.query.attempt)

        this.attemptRepository.setInstanceKey(req.instancekey);
        var attempt = await this.attemptRepository.findOne({
            _id: attemptID
        }, null, { populate: { path: 'attemptdetails', select: '-_id QA', options: { lean: true } } })
        if (attempt) {
            var isEvaluated = attempt.isEvaluated;
            var subs = attempt.subjects.slice()
            subs = subs === null ? [] : subs
            attempt = this.removeAttemptDetails(attempt)
            // It will contain the question ids of all the previously attempted questions of this set.
            var questionsPresented = []
            if (!attempt.QA) {
                attempt.QA = [];
            }
            for (var x = 0; x < attempt.QA.length; x++)
                questionsPresented.push(attempt.QA[x].question)

            // To check if this question is already attemted and client is trying to attempt it again.
            // var isInArray = questionsPresented.some(function (ques) {
            //     return ques.equals(response.prevQuestion._id)
            // })

            // object to store inside QA field.
            var ques: any = {}
            ques.topic = response.prevQuestion.topic
            ques.unit = response.prevQuestion.unit
            ques.subject = response.prevQuestion.subject
            ques.index = req.body.index + 1

            ques.answers = [];

            if (req.query.category) {
                ques.category = req.query.category
            } else {
                ques.category = 'mcq'
            }

            if (req.query.answers.length > 0) {
                if (req.query.category === 'mcq') {
                    ques.answers = req.query.answers.map(a => {
                        return { answerId: a }
                    });
                } else if (req.query.category === 'fib') {
                    ques.answers = req.query.answers;
                } else if (req.query.category === 'code') {
                    ques.answers = req.query.answers;
                } else if (req.query.category === 'mixmatch') {
                    ques.answers = req.query.answers;
                } else if (req.query.category == 'descriptive') {
                    ques.answers = req.query.answers;
                }
            }

            ques.question = response.prevQuestion._id

            if (answerIDs.length == 0)
                ques.isMissed = true

            let currTime = new Date()
            let currISOTime = currTime.toISOString()

            ques.timeEslapse = req.query.qSpendTime;
            ques.answerChanged = 0
            if (resp.isMarksLevel) {
                ques.actualMarks = resp.plusMark
            } else {
                ques.actualMarks = response.prevQuestion.plusMark
            }

            ques.minusMark = response.prevQuestion.minusMark
            ques.createdAt = currISOTime
            if (req.query.feedback == true || req.query.feedback == 'true') {
                ques.feedback = true;
            }

            if (req.body.scratchPad) {
                ques.scratchPad = req.body.scratchPad
            }
            // Some variables that needs to be updated in attempt.
            var totalMark = attempt.totalMark
            var plusMark = attempt.plusMark
            var minusMark = attempt.minusMark
            var totalMissed = attempt.totalMissed
            var totalErrors = attempt.totalErrors
            var pending = attempt.pending
            var totalTime = attempt.totalTime + ques.timeEslapse

            var totalCorrects = attempt.totalCorrects
            var totalQuestions = (attempt.totalQuestions || 0) + 1

            var maximumMarks = attempt.maximumMarks
            if (resp.isMarksLevel) {
                maximumMarks += resp.plusMark;
            } else {
                maximumMarks += response.prevQuestion.plusMark
            }

            if (answerIDs.length == 0) {
                ques.status = Constants.MISSED
                totalMissed += 1
                ques.obtainMarks = 0
            } else if (ques.category == 'descriptive') {
                ques.status = Constants.PENDING
                ques.obtainMarks = 0
                isEvaluated = false;
                pending++;
            } else if (response.isCorrect) {
                if (resp.isMarksLevel) {
                    plusMark += resp.plusMark
                    totalMark += resp.plusMark
                    ques.obtainMarks = resp.plusMark
                } else {
                    plusMark += response.prevQuestion.plusMark
                    totalMark += response.prevQuestion.plusMark
                    ques.obtainMarks = response.prevQuestion.plusMark
                }
                ques.status = Constants.CORRECT
                totalCorrects += 1
            } else {
                ques.status = Constants.INCORRECT
                totalErrors += 1

                if (resp.isMarksLevel) {
                    minusMark += resp.minusMark
                    ques.obtainMarks = resp.minusMark
                    totalMark += resp.minusMark
                } else {
                    minusMark += response.prevQuestion.minusMark
                    totalMark += response.prevQuestion.minusMark
                    ques.obtainMarks = response.prevQuestion.minusMark
                }
            }

            // Create Subjects
            let question = response.prevQuestion

            for (var i = 0; i < subs.length; i++) {
                let sub = subs[i]
                if (sub._id.equals(question.subject._id))
                    break
            }
            if (i >= subs.length) {
                subs.push({
                    _id: question.subject._id,
                    name: question.subject.name,
                    units: [],
                    accuracy: 0,
                    speed: 0,
                    mark: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    pending: 0,
                    maxMarks: 0
                })
            }

            for (var j = 0; j < subs[i].units.length; j++) {
                let top = subs[i].units[j]
                if (top._id.equals(question.unit._id)) {
                    break
                }
            }

            if (j >= subs[i].units.length) {
                subs[i].units.push({
                    _id: question.unit._id,
                    name: question.unit.name,
                    topics: [],
                    accuracy: 0,
                    speed: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    mark: 0,
                    pending: 0,
                    maxMarks: 0
                })
            }

            for (var k = 0; k < subs[i].units[j].topics.length; k++) {
                let top = subs[i].units[j].topics[k]
                if (top._id.equals(question.topic._id))
                    break
            }

            if (k >= subs[i].units[j].topics.length) {
                subs[i].units[j].topics.push({
                    _id: question.topic._id,
                    name: question.topic.name,
                    accuracy: 0,
                    speed: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    mark: 0,
                    pending: 0,
                    maxMarks: 0
                })
            }

            if (ques.status === Constants.CORRECT) {
                subs[i].correct += 1
                subs[i].units[j].correct += 1
                subs[i].units[j].topics[k].correct += 1
            } else if (ques.status === Constants.INCORRECT) {
                subs[i].incorrect += 1
                subs[i].units[j].incorrect += 1
                subs[i].units[j].topics[k].incorrect += 1
            } else if (ques.status === Constants.MISSED) {
                subs[i].missed += 1
                subs[i].units[j].missed += 1
                subs[i].units[j].topics[k].missed += 1
            } else {
                subs[i].pending += 1
                subs[i].units[j].pending += 1
                subs[i].units[j].topics[k].pending += 1
            }

            subs[i].mark += ques.obtainMarks
            subs[i].maxMarks += ques.actualMarks
            subs[i].accuracy = subs[i].maxMarks > 0 ? subs[i].mark / subs[i].maxMarks : 0
            subs[i].speed = (((subs[i].speed) * (subs[i].correct + subs[i].incorrect + subs[i].pending - 1)) + ques.timeEslapse) / (subs[i].correct + subs[i].incorrect + subs[i].pending)

            subs[i].units[j].mark += ques.obtainMarks
            subs[i].units[j].maxMarks += ques.actualMarks
            subs[i].units[j].accuracy = subs[i].units[j].maxMarks > 0 ? subs[i].units[j].mark / subs[i].units[j].maxMarks : 0
            subs[i].units[j].speed = (((subs[i].units[j].speed) * (subs[i].units[j].correct + subs[i].units[j].incorrect + subs[i].units[j].pending - 1)) + ques.timeEslapse) / (subs[i].units[j].correct + subs[i].units[j].incorrect + subs[i].units[j].pending)

            subs[i].units[j].topics[k].mark += ques.obtainMarks
            subs[i].units[j].topics[k].maxMarks += ques.actualMarks
            subs[i].units[j].topics[k].accuracy = subs[i].units[j].topics[k].maxMarks > 0 ? subs[i].units[j].topics[k].mark / subs[i].units[j].topics[k].maxMarks : 0
            subs[i].units[j].topics[k].speed = (((subs[i].units[j].topics[k].speed) * (subs[i].units[j].topics[k].correct + subs[i].units[j].topics[k].incorrect + subs[i].units[j].topics[k].pending - 1)) + ques.timeEslapse) / (subs[i].units[j].topics[k].correct + subs[i].units[j].topics[k].incorrect + subs[i].units[j].topics[k].pending)

            var fieldsToSet: any = {
                'totalMark': totalMark,
                'plusMark': plusMark,
                'minusMark': minusMark,
                'totalMissed': totalMissed,
                'totalErrors': totalErrors,
                'totalTime': totalTime,
                'totalCorrects': totalCorrects,
                pending: pending,
                'updatedAt': currISOTime,
                'totalQuestions': totalQuestions,
                'subjects': subs,
                'maximumMarks': maximumMarks,
                'lastIndex': resp.totalQuestion > attempt.QA.length ? attempt.QA.length : resp.totalQuestion - 1,
                isEvaluated: isEvaluated
            }

            // user finish the test
            if (resp.totalQuestion === totalQuestions) {
                fieldsToSet.partiallyAttempted = false;
            }

            var doc: any;
            try {
                this.attemptRepository.setInstanceKey(req.instancekey);
                doc = await this.attemptRepository.findOneAndUpdate({
                    _id: attemptID
                }, {
                    $set: fieldsToSet
                }, {
                    new: true
                })
            } catch (err) {
                Logger.error(err)
                throw new InternalServerErrorException('Something went wrong while updating Attempt!');
            }

            if (!doc.partiallyAttempted) {
                this.redisCache.del(req, `${req.user._id.toString()}_learning_question_order_${attempt.practicesetId.toString()}`)
                if (doc.referenceType == 'course' && doc.referenceId) {
                    await this.updateUserCourse(req.instancekey, doc.user, { course: doc.referenceId, content: doc.referenceData }, doc)
                }
            }

            var attemptDetailsdoc: AttemptDetail;
            try {
                this.attemptDetailRepository.setInstanceKey(req.instancekey);
                attemptDetailsdoc = await this.attemptDetailRepository.findOneAndUpdate({
                    attempt: attemptID
                }, {
                    $push: {
                        QA: ques
                    }
                }, {
                    new: true
                })
            } catch (err) {
                throw new InternalServerErrorException('Something went wrong while updating Attempt!');
            }

            var totalTime = resp.totalTime

            doc = await this.attemptRepository.findByIdAndUpdate(doc._id, doc);
            if (req.body.finish) {
                const details = await this.attemptDetailRepository
                    .findOne({
                        _id: doc.attemptdetails
                    });
                var l = details.QA.length
                var deltaTime = totalTime / l
                var timeLeft = totalTime
                var qss = details.QA
                for (var k = 0; k < l; k++) {
                    let qs = details.QA[k]
                    qs.index = k + 1;
                    qs.stdTime = totalTime - k * deltaTime
                    if (k != 0) {
                        timeLeft = timeLeft - (qss[k - 1].timeEslapse / 60000)
                    }
                    qs.timeLeft = timeLeft
                }
                //  @ad- no use of save here
                // details.save()

                return {
                    'status': 202,
                    'practiceset': resp,
                    'lastIndex': doc.lastIndex,
                    'questionsAttempted': doc.totalQuestions,
                    'previousResponse': details.QA[details.QA.length - 1]
                }

            } else {
                return {
                    'status': 202,
                    'practiceset': resp,
                    'lastIndex': doc.lastIndex,
                    'questionsAttempted': doc.totalQuestions,
                    'previousResponse': attemptDetailsdoc.QA[attemptDetailsdoc.QA.length - 1]
                }
            }
        }
    }

    // It takes answers of previous question, 
    // verifies it and return the next question on the basis of correctness.
    async getNextQuestionLearningTest(req: GetNextQuestionLearningTestRequest) {
        req.query = req.body;
        var answerIDs = []
        var correctAnswer = 0
        var userAnswers = [];
        var answers = [];
        var question = {};
        var answerOptionCount = [];
        var userAnswerCount = 0;
        var resp;
        if (!req.query.testId) {
            throw new PreconditionFailedException('Invalid parameters.');
        } else {
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const respracticeSet = await this.practiceSetRepository.findOne({
                _id: new ObjectId(req.query.testId)
            }, {
                questions: 1,
                totalQuestion: 1,
                testType: 1,
                testMode: 1,
                isMarksLevel: 1,
                minusMark: 1,
                plusMark: 1,
                totalTime: 1,
                enabledCodeLang: 1,
                user: 1,
                randomQuestions: 1,
                randomizeAnswerOptions: 1
            }, { lean: true })

            if (!respracticeSet) {
                throw new InternalServerErrorException();
            }
            resp = respracticeSet;

            if (req.query.answers) {
                userAnswers = req.query.answers;
                for (var i = 0; i < userAnswers.length; i++) {
                    answerIDs.push(userAnswers[i])
                }
            }

            var response: any = await this.previousQuestionDetail(req, question, answers, answerOptionCount, userAnswers, userAnswerCount, correctAnswer);
            const result = await this.getPreviousResponseDetail(req, response, resp, answerIDs);

            this.attemptRepository.setInstanceKey(req.instancekey);
            const results = await this.attemptRepository
                .findOne({ _id: new ObjectId(req.query.attempt) }, null, { lean: true });

            if (resp.totalQuestion === result.questionsAttempted && String(resp.user) != String(req.user._id)) {
                await this.attemptProcessor.updateUserLevel(req.instancekey, results)
            }

            var nextIndex = (result.lastIndex + 1) > (resp.totalQuestion - 1) ? result.lastIndex : result.lastIndex + 1

            await this.sortQuestions(req, resp, false, req.query.attempt)

            this.questionRepository.setInstanceKey(req.instancekey)
            response = await this.questionRepository.findOne({ _id: resp.questions[nextIndex].question }, null, { lean: true })

            await this.filterCodeLanguages(req, resp, response)
            this.sortAnswers(resp, response)
            response.currPage = result.lastIndex + 2;
            response.previousResponse = result.previousResponse;

            return response;
        }
    }
} 