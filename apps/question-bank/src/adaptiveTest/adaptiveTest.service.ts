import { AttemptDetailRepository, AttemptRepository, AttendanceRepository, isEmail, PracticeSetRepository, QuestionRepository, RedisCaching, SubjectRepository, UnitRepository } from '@app/common';
import { CheckQuestionCountInAdaptiveTestRequest, GenerateAdaptiveLearningTestRequest, GenerateAdaptiveTestRequest, GetAdaptiveTestRequest, GetFirstQuestionRequest, GetNextQuestionRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotAcceptableException, NotFoundException, PreconditionFailedException, UnprocessableEntityException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcCancelledException, GrpcInternalException, GrpcInvalidArgumentException } from 'nestjs-grpc-exceptions';
import * as _ from 'lodash';
import { config } from '@app/common/config';
import { S3Service } from '@app/common/components/aws/s3.service';
import { fibAnswerCompare } from '@app/common/helpers/attempt';
import { AttemptProcessor } from '@app/common/components/AttemptProcessor';

@Injectable()
export class AdaptiveTestService {
    mSD: any = {};

    constructor(private readonly questionRepository: QuestionRepository,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly attemptRepository: AttemptRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly unitRepository: UnitRepository,
        private readonly attendanceRepository: AttendanceRepository,
        private readonly redisCache: RedisCaching,
        private readonly s3Service: S3Service,
        private readonly attemptProcessor: AttemptProcessor,
    ) {
    }

    async generateAdaptiveTest(req: GenerateAdaptiveTestRequest) {
        try {

            if (!req.body.subject || !req.body.unit) {
                throw new BadRequestException({ status: 400, message: 'Missing subject or unit.' });
            }
            var data: any = {}
            data.user = new ObjectId(req.user._id)
            data.userInfo = {
                '_id': new ObjectId(req.user._id),
                'name': req.user.name
            }
            var d = new Date()
            data.title = 'Adaptive test for ' + String(req.user.name) + ' on ' + d.toISOString().split('T')[0]
            var timePerQuestion = 1.5
            data.totalQuestion = 20
            data.totalTime = 20 * timePerQuestion
            var subjectsArray = []
            var questionArray = [];

            var condition: any = {
                isActive: true,
                isAllowReuse: 'global',
                category: 'mcq',
                "subject._id": new ObjectId(req.body.subject),
                "unit._id": new ObjectId(req.body.unit)
            };

            const correctlyAttemptedQuestions = await this.getCorrectlyAttemptedQuestions(req);
            if (correctlyAttemptedQuestions.length > 0) {
                condition._id = { $nin: correctlyAttemptedQuestions };
            }

            this.questionRepository.setInstanceKey(req.instancekey);
            const foundQuestions = await this.questionRepository.aggregate([
                { $match: condition },
                { $project: { complexity: 1, createdAt: 1, subject: 1, tComplexity: 1, topic: 1, unit: 1 } }
            ]);

            if (!foundQuestions.length) {
                throw new InternalServerErrorException({ error: 'Sufficient number of questions are not available to generate an Adaptive Test.' });
            }

            const { questionsPresented, subjectsOfQuestions, unitsOfQuestions } = this.processQuestions(foundQuestions, data);

            if (questionsPresented.length < 30) {
                throw new InternalServerErrorException({ error: 'Sufficient number of questions are not available to generate an Adaptive Test.' });
            }

            data.subjects = subjectsOfQuestions;
            data.units = Object.values(unitsOfQuestions);

            const practiceSetData = this.buildPracticeSetData(req, data);

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const practiceSetCreated = await this.practiceSetRepository.create(practiceSetData);

            const doc: any = await new Promise((resolve) => {
                this.redisCache.getAdaptiveQuestion({ instancekey: req.instancekey, user: { _id: new ObjectId(req.user._id) } }, practiceSetCreated._id, questionsPresented, function (doc: any) {
                    resolve(doc);
                }
                );
            });

            if (!doc) {
                throw new InternalServerErrorException({ error: 'Internal error PracticeSet...' });
            }

            const practiceSet = await this.practiceSetRepository.populate(practiceSetCreated, { path: 'user', select: '-salt -hashedPassword' })


            return { response: practiceSet };
        } catch (error) {
            Logger.error(error);

            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message);
            } else if (error instanceof InternalServerErrorException) {
                throw new GrpcInternalException(error.getResponse());
            }
            throw new GrpcInternalException({ message: 'Internal server error' });
        }
    }


    private async getCorrectlyAttemptedQuestions(req: any): Promise<string[]> {
        try {
            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            const questions = await this.attemptDetailRepository.aggregate([
                { $match: { "user": new ObjectId(req.user._id as string) } },
                { $project: { QA: 1 } },
                { $unwind: "$QA" },
                {
                    $match: {
                        "QA.status": { $in: [1, 5] },
                        "QA.unit._id": new ObjectId(req.body.unit)
                    }
                },
                { $project: { _id: "$QA.question" } },
            ]);

            return questions.map((q: any) => q._id);
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }

    }

    private processQuestions(foundQuestions: any[], data: any): any {
        try {
            const easyQuestions = foundQuestions.filter(q => q.complexity === 'easy');
            const moderateQuestions = foundQuestions.filter(q => q.complexity === 'moderate');
            const hardQuestions = foundQuestions.filter(q => q.complexity === 'hard');

            let mini = Math.min(easyQuestions.length, Math.min(moderateQuestions.length, hardQuestions.length));
            mini = Math.min(mini, 100);

            //Take equal number of Question by  complexity 
            if (mini > 100) {
                mini = 100;
            }

            if (mini < 20) {
                data.totalQuestion = mini;
            }

            const quesFromUnit = [
                ...easyQuestions.slice(0, mini),
                ...moderateQuestions.slice(0, mini),
                ...hardQuestions.slice(0, mini),
            ];

            const questionsPresented = [];
            const subjectsOfQuestions = [];
            const unitsOfQuestions = {};
            var subjectsArray = [];
            const questionArray = [];

            for (const q of quesFromUnit) {
                if (!questionArray.includes(String(q._id))) {
                    questionArray.push(String(q._id))
                    questionsPresented.push({
                        '_id': q._id,
                        'complexity': q.complexity,
                        'tComplexity': q.tComplexity
                    })
                }

                if (subjectsArray.includes(String(q.subject._id))) {
                    subjectsArray.push(String(q.subject._id))
                    var subject = {
                        '_id': q.subject._id,
                        'name': q.subject.name
                    }
                    subjectsOfQuestions.push(subject)
                }

                if (!unitsOfQuestions[q.unit._id.toString()]) {
                    unitsOfQuestions[q.unit._id.toString()] = { _id: q.unit._id, name: q.unit.name };
                }
            }

            return { questionsPresented, subjectsOfQuestions, unitsOfQuestions };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }

    }

    private buildPracticeSetData(req: GenerateAdaptiveTestRequest, data: any): any {
        try {
            return {
                user: new ObjectId(req.user._id),
                userInfo: { '_id': new ObjectId(req.user._id), 'name': req.user.name },
                subjects: data.subjects,
                units: data.units,
                title: data.title,
                totalTime: data.totalQuestion * 1.5,
                totalAttempt: 1,
                attemptAllowed: 1,
                enableMarks: true,
                isMarksLevel: false,
                totalJoinedStudent: 1,
                isAdaptive: true,
                totalQuestion: data.totalQuestion,
                questionsToDisplay: data.totalQuestion < 20 ? data.totalQuestion : 20,
                accessMode: 'invitation',
                status: 'published',
                initiator: 'student',
                inviteeEmails: isEmail(req.user.userId) ? [req.user.userId] : [],
                inviteePhones: !isEmail(req.user.userId) ? [req.user.userId] : [],
                questions: [],
                testMode: req.body.learningMode ? 'learning' : 'practice',
                locations: [new ObjectId(req.user.activeLocation)],
            };
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async checkQuestionCountInAdaptiveTest(req: CheckQuestionCountInAdaptiveTestRequest) {
        try {

            if (!req.body.subject || !req.body.unit) {
                throw new BadRequestException('Missing subject or unit.');
            }
            // To autogenerate adaptive Test
            var data: any = {}
            data.user = new ObjectId(req.user._id)
            data.userInfo = {
                '_id': new ObjectId(req.user._id),
                'name': req.user.name
            }
            var d = new Date()
            data.title = 'Adaptive test for ' + String(req.user.name) + ' on ' + d.toISOString().split('T')[0]
            var timePerQuestion = 1.5
            data.totalQuestion = 20
            data.totalTime = 20 * timePerQuestion

            var condition: any = {
                isActive: true,
                isAllowReuse: 'global',
                category: 'mcq',
                "subject._id": new ObjectId(req.body.subject),
                "unit._id": new ObjectId(req.body.unit)
            };

            const correctlyAttemptedQuestions = await this.getCorrectlyAttemptedQuestions(req);
            if (correctlyAttemptedQuestions.length > 0) {
                condition._id = { $nin: correctlyAttemptedQuestions };
            }

            this.questionRepository.setInstanceKey(req.instancekey);
            const foundQuestions = await this.questionRepository.aggregate([
                { $match: condition },
                { $project: { complexity: 1, createdAt: 1, subject: 1, tComplexity: 1, topic: 1, unit: 1 } }
            ]);

            const { questionsPresented, subjectsOfQuestions, unitsOfQuestions } = this.processQuestions(foundQuestions, data);

            return {
                questions: questionsPresented,
                subjects: subjectsOfQuestions,
                units: Object.values(unitsOfQuestions)
            };
        } catch (error) {
            Logger.error(error);
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message);
            }

            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async generateAdaptiveLearningTest(req: GenerateAdaptiveLearningTestRequest) {
        try {
            if (!req.body.subject || !req.body.unit) {
                throw new BadRequestException('Missing subject or unit.')
            }

            var condition: any = {
                isActive: true,
                isAllowReuse: 'global',
                category: { $nin: ['descriptive'] },
                "subject._id": new ObjectId(req.body.subject),
                "unit._id": new ObjectId(req.body.unit)
            };

            let practiceSetExist = null;
            this.attemptRepository.setInstanceKey(req.instancekey);
            let testIds = await this.attemptRepository.distinct('practicesetId', {
                "createdBy.user": new ObjectId(req.user._id), "subjects.0.units.0._id": new ObjectId(req.body.unit)
            })

            if (testIds.length > 0) {
                this.practiceSetRepository.setInstanceKey(req.instancekey)
                practiceSetExist = await this.practiceSetRepository
                    .findOne({
                        _id: { $in: testIds },
                        "subjects._id": new ObjectId(req.body.subject),
                        "units._id": new ObjectId(req.body.unit),
                        user: new ObjectId(req.user._id),
                        testMode: "learning",
                        isAdaptive: false
                    }, null, { lean: true });
            }

            if (practiceSetExist) {
                let existingQIds = [];
                if (practiceSetExist.questions.length > 0) {
                    practiceSetExist.questions.forEach((q, index) => {
                        existingQIds.push(q.question)
                    })
                    condition._id = { $nin: existingQIds }
                }

                this.questionRepository.setInstanceKey(req.instancekey);
                let questions = await this.questionRepository.find(condition, {}, { lean: true });
                let lang = [];

                if (questions.length > 0) {
                    questions.forEach((q, i) => {
                        if (q.category === 'code') {
                            q.coding.forEach((l) => {
                                if (lang.indexOf(l.language) === -1) {
                                    lang.push(l.language);
                                }
                            })
                        }
                        practiceSetExist.questions.push({
                            section: q.subject.name,
                            question: q._id,
                            createdAt: new Date(),
                            plusMark: q.plusMark,
                            minusMark: q.minusMark,
                            order: practiceSetExist.questions.length + 1
                        })

                    })
                    practiceSetExist.totalQuestion = practiceSetExist.questions.length;
                    practiceSetExist.enabledCodeLang = [];
                    practiceSetExist.enabledCodeLang = lang;

                    practiceSetExist.totalTime = practiceSetExist.totalQuestion * 1.5;
                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    await this.practiceSetRepository
                        .updateOne({ _id: practiceSetExist._id }, {
                            $set:
                            {
                                questions: practiceSetExist.questions,
                                totalQuestion: practiceSetExist.totalQuestion,
                                totalTime: practiceSetExist.totalTime
                            }
                        });

                    return { _id: practiceSetExist._id };

                } else {
                    return { _id: practiceSetExist._id };

                }
            } else {
                this.questionRepository.setInstanceKey(req.instancekey);
                let questions = await this.questionRepository.find(condition, null, { lean: true });

                if (questions.length <= 0) {
                    throw new UnprocessableEntityException({ "msg": "Sufficient number of questions are not available to generate an Adaptive Learning Test" });
                }

                let data: any = {};
                data.subjects = [];
                data.units = []
                let d = new Date()
                data.title = 'Learning test for ' + String(req.user.name) + ' on ' + d.toISOString().split('T')[0]


                // get subject
                this.subjectRepository.setInstanceKey(req.instancekey);
                let subject = await this.subjectRepository.findOne({ _id: req.body.subject }, null, { lean: true });
                data.subjects.push({
                    _id: subject._id,
                    name: subject.name
                })

                // get unit
                this.unitRepository.setInstanceKey(req.instancekey);
                let unit = await this.unitRepository.findOne({ _id: req.body.unit }, null, { lean: true });
                data.units.push({
                    _id: unit._id,
                    name: unit.name
                })

                let questionArray = [];
                let lang = [];
                questions.forEach((q, i) => {
                    if (q.category === 'code') {
                        q.coding.forEach((l) => {
                            if (lang.indexOf(l.language) === -1) {
                                lang.push(l.language);
                            }
                        })
                    }

                    questionArray.push({
                        section: subject.name,
                        question: q._id,
                        createdAt: new Date(),
                        plusMark: q.plusMark,
                        minusMark: q.minusMark,
                        order: i + 1
                    })
                })

                data.user = new ObjectId(req.user._id)
                data.userInfo = {
                    '_id': new ObjectId(req.user._id),
                    'name': req.user.name
                }
                //get availabel questions from QB based on user selection.
                let timePerQuestion = 1.5;
                data.totalQuestion = questionArray.length;

                var practiceSetData: any = {}
                practiceSetData.user = new ObjectId(req.user._id)
                practiceSetData.userInfo = {
                    '_id': new ObjectId(req.user._id),
                    'name': req.user.name
                }
                practiceSetData.subjects = data.subjects;

                practiceSetData.units = data.units;
                practiceSetData.title = data.title;
                practiceSetData.enabledCodeLang = lang;
                practiceSetData.totalTime = data.totalQuestion * timePerQuestion
                practiceSetData.totalQuestion = data.totalQuestion

                // It will always be 1 for adaptive tests
                practiceSetData.totalAttempt = 1
                practiceSetData.attemptAllowed = 0;
                practiceSetData.enableMarks = true
                practiceSetData.isMarksLevel = false
                practiceSetData.totalJoinedStudent = 1
                practiceSetData.isAdaptive = false

                practiceSetData.accessMode = 'invitation'
                practiceSetData.status = 'published'
                practiceSetData.initiator = 'student'
                practiceSetData.testMode = 'learning';
                practiceSetData.inviteeEmails = []
                practiceSetData.inviteePhones = []
                if (isEmail(req.user.userId)) {
                    practiceSetData.inviteeEmails.push(req.user.userId)
                } else {
                    practiceSetData.inviteePhones.push(req.user.userId)
                }


                practiceSetData.questions = questionArray;
                practiceSetData.locations = [new ObjectId(req.user.activeLocation)]

                this.practiceSetRepository.setInstanceKey(req.instancekey);
                let newPracticeSet = await this.practiceSetRepository.create(practiceSetData);



                return { _id: newPracticeSet._id };
            }
        } catch (error) {
            Logger.error(error);
            if (error instanceof UnprocessableEntityException) {
                throw new GrpcCancelledException(error.getResponse());
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    private async getQuestion(parameters: any, req: GetFirstQuestionRequest) {
        try {
            var Ids: any = await new Promise((resolve) => {
                this.redisCache.getAdaptiveQuestion({ instancekey: req.instancekey, user: { _id: new ObjectId(req.user._id) } }, parameters._id, null, function (Ids: any) {
                    resolve(Ids);
                }
                );
            });
            var questionIds = []

            if (!Ids) {
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                var practice = await this.practiceSetRepository.findOne({
                    _id: parameters._id
                }, {
                    questions: 1
                }, {
                    lean: true
                })
                practice = await this.practiceSetRepository.populate(practice, 'questions.question')

                if (practice) {
                    for (var i = 0; i < practice.questions.length; i++) {
                        questionIds.push({
                            _id: practice.questions[i].question._id,
                            attemptID: parameters.attemptID,
                            autoGenerated: false,
                            complexity: practice.questions[i].question.complexity,
                            tComplexity: practice.questions[i].question.tComplexity,
                            subject: practice.questions[i].question.subject._id
                        })
                    }
                    questionIds = _.uniq(questionIds, false)
                    return { questions: questionIds, autoGenerated: false, parameters: parameters };
                }
            } else {
                if (Ids.length > 0) {
                    Ids = _.uniq(Ids, false)

                    for (var i = 0; i < Ids.length; i++) {
                        Ids[i].attemptID = parameters.attemptID
                    }

                    return { questions: Ids, autoGenerated: true, parameters: parameters }

                } else {
                    throw new InternalServerErrorException({
                        'status': 500,
                        'error': 'Either questions of required difficulty level are absent or parameters are not valid.'
                    });
                }
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private async questionFormPythonApi(req: any, apiEndPoint: string, reqBody: any, autoGenerated: any, parameters: any) {
        try {
            if (this.mSD[parameters._id]) {
                if (this.mSD[parameters._id].activeSubjectIndex != (this.mSD[parameters._id].subjects.length - 1)) {
                    if (this.mSD[parameters._id].attemptedQuestion == this.mSD[parameters._id].qfirst) {
                        this.mSD[parameters._id].attemptedQuestion = 1
                        apiEndPoint = 'firstQuestion';
                        this.mSD[parameters._id].activeSubjectIndex++;
                        reqBody = {
                            questions: this.mSD[parameters._id].subjectWiseQuestion[this.mSD[parameters._id].subjects[this.mSD[parameters._id].activeSubjectIndex]]
                        }
                    } else {
                        this.mSD[parameters._id].attemptedQuestion++
                    }
                }
            }
            reqBody.method = apiEndPoint

            if (config.aws.lambda.functions.adaptive) {                
                const data: any = await this.s3Service.adaptive(apiEndPoint, reqBody)

                if (data.StatusCode && data.Payload) {
                    try {
                        let adaptiveRes = JSON.parse(data.Payload)
                        if (adaptiveRes.question) {
                            await this.processAdaptiveResult(req, apiEndPoint, reqBody, autoGenerated, parameters, adaptiveRes)
                        } else {
                            throw new NotFoundException();
                        }
                    } catch (error) {
                        Logger.error(error)
                        throw new InternalServerErrorException();
                    }
                } else {
                    Logger.error(data)
                    throw new BadRequestException();
                }
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }


    async processAdaptiveResult(req: GetFirstQuestionRequest, apiEndPoint: any, reqBody: any, autoGenerated: any, parameters: any, adaptiveRes: any) {
        try {
            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            const alreadyAttempted = await this.attemptDetailRepository.findOne({
                attempt: parameters.attemptID,
                "QA.question": adaptiveRes.question
            }, {
                _id: 1
            });
            if (alreadyAttempted) {
                Logger.debug("Question already attempted")
                reqBody.index = adaptiveRes.index;
                reqBody.object = adaptiveRes.object;
                this.questionFormPythonApi(req, apiEndPoint, reqBody, autoGenerated, parameters)
            } else {
                this.questionRepository.setInstanceKey(req.instancekey);
                const question = await this.questionRepository.findOne({
                    _id: adaptiveRes.question
                }, {
                    category: 1,
                    plusMark: 1,
                    minusMark: 1,
                    questionHeader: 1,
                    questionType: 1,
                    subject: 1,
                    unit: 1,
                    topic: 1,
                    questionTextArray: 1,
                    complexity: 1,
                    createdAt: 1,
                    questionText: 1,
                    prefferedLanguage: 1,
                    answers: 1,
                    tComplexity: 1,
                    answerExplain: 1,
                    coding: 1,
                    wordLimit: 1
                }, { lean: true })
                let result = question;
                if (!result.tComplexity) {
                    if (result.complexity === 'easy')
                        result.tComplexity = 0.2;

                    else if (result.complexity === 'moderate')
                        result.tComplexity = 0.5;

                    else result.tComplexity = 0.8
                }
                if (parameters.previousResponse) {
                    result.previousResponse = parameters.previousResponse;

                }
                result.index = adaptiveRes.index
                result.adaptiveObject = adaptiveRes.object
                result.attemptID = parameters.attemptID
                if (!autoGenerated) {
                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    const practiceSet = await this.practiceSetRepository.findOne({
                        _id: parameters._id
                    }, {
                        plusMark: 1,
                        minusMark: 1
                    }, { lean: true });
                    result.plusMark = practiceSet.plusMark
                    result.minusMark = practiceSet.minusMark


                    return result

                } else {
                    var questionToAdd = {
                        section: question.subject._id,
                        question: question._id,
                        plusMark: question.plusMark,
                        minusMark: question.minusMark
                    }

                    this.practiceSetRepository.setInstanceKey(req.instancekey);
                    const updatedSet = await this.practiceSetRepository.updateOne({
                        _id: parameters._id
                    }, {
                        $addToSet: {
                            questions: questionToAdd
                        }
                    })

                    return result;
                }
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private async updateTestAttendance(req: GetFirstQuestionRequest, testId: ObjectId) {
        try {
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            const test = await this.practiceSetRepository.findById(testId);

            if (test.requireAttendance) {
                this.attendanceRepository.setInstanceKey(req.instancekey);
                const attendance = await this.attendanceRepository.findOneAndUpdate({
                    practicesetId: test._id,
                    studentId: new ObjectId(req.user._id),
                    active: true
                }, {
                    status: 'started'
                }, {
                    new: true
                });

                // socketServer.toUser(req.headers.instancekey, attendance.teacherId, 'attendance.update', {
                //     studentId: attendance.studentId,
                //     status: attendance.status,
                //     admitted: attendance.admitted
                // });

            } else {
                // Create an attendance for user to save test limit
                var attendance = await this.attendanceRepository.findOne({
                    practicesetId: test._id,
                    studentId: new ObjectId(req.user._id)
                })

                if (!attendance) {
                    attendance = await this.attendanceRepository.create({
                        practicesetId: test._id,
                        studentId: new ObjectId(req.user._id),
                        name: req.user.name,
                        studentUserId: req.user.userId
                    })
                } else {
                    attendance.updatedAt = Date.now()
                }

                attendance.attemptLimit = test.attemptAllowed
                attendance.status = 'started'

                if (test.offscreenLimit) {
                    attendance.offscreenLimit = test.offscreenLimit
                }

                // socketServer.toTestRoom(req.headers.instancekey, test._id, 'test.join', {
                //     studentId: req.user._id.toString(),
                //     name: req.user.name,
                //     userId: req.user.userId,
                //     attemptLimit: attendance.attemptLimit,
                //     offscreenLimit: attendance.offscreenLimit,
                //     status: attendance.status
                // })
            }
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getFirstQuestion(req: GetFirstQuestionRequest) {
        try {
            
            var practicesetId = new ObjectId(req.query.practiceset)

            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let test = await this.practiceSetRepository.findById(practicesetId);

            this.attemptRepository.setInstanceKey(req.instancekey);
            let alreadyAttempted = await this.attemptRepository.findOne({
                practicesetId: practicesetId,
                user: new ObjectId(req.user._id)
            }, null, { lean: true });

            if (!alreadyAttempted) {
                this.practiceSetRepository.setInstanceKey(req.instancekey);
                test = await this.practiceSetRepository.findByIdAndUpdate(practicesetId, { $inc: { totalJoinedStudent: 1 } })
            }
            var questionsToDisplay = test.questionsToDisplay;
            var attemptData: any = {}
            attemptData.user = new ObjectId(req.user._id);
            attemptData.studentName = req.user.name;
            attemptData.isAbandoned = false;
            attemptData.practicesetId = test._id
            attemptData.isShowAttempt = test.isShowAttempt
            attemptData.practiceSetInfo = {
                'title': test.title,
                'titleLower': test.titleLower,
                'subjects': test.subjects,
                'units': test.units,
                'createdBy': test.user,
                'accessMode': test.accessMode,
                'classRooms': test.classRooms,
                'isAdaptive': test.isAdaptive,
                'adaptiveTest': test.adaptiveTest
            }
            attemptData.createdBy = {
                'user': new ObjectId(req.user._id),
                'name': req.user.name
            }
            attemptData.totalQuestions = 0
            attemptData.email = req.user.email
            attemptData.QA = []
            attemptData.location = new ObjectId(req.user.activeLocation)

            // Add subjects here
            attemptData.subjects = []

            this.attemptRepository.setInstanceKey(req.instancekey);
            var newAttempt = await this.attemptRepository.create(attemptData)

            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            var attemptdetails = await this.attemptDetailRepository.create({
                attempt: newAttempt._id,
                practicesetId: test._id,
                isAbandoned: false,
                QA: [],
                user: new ObjectId(req.user._id)
            })

            newAttempt.attemptdetails = attemptdetails._id
            await this.attemptRepository.findByIdAndUpdate(newAttempt._id, newAttempt);

            var params = {
                _id: practicesetId,
                questions: test.questions,
                attemptID: newAttempt._id
            }

            const { questions, autoGenerated, parameters } = await this.getQuestion(params, req);

            var question_json: any = []
            let subjects = [];
            let subjectWiseQuestion = {}
            questions.map(q => {
                var temp: any = {}
                temp.question = q._id;
                if (q.tComplexity) {
                    temp.difficulty = q.tComplexity;
                } else {
                    if (q.complexity === 'easy')
                        temp.difficulty = 0.2;

                    else if (q.complexity === 'moderate')
                        temp.difficulty = 0.5;

                    else temp.difficulty = 0.8
                }
                if (subjectWiseQuestion[q.subject]) {
                    subjectWiseQuestion[q.subject].push(temp)
                } else {
                    subjectWiseQuestion[q.subject] = []

                    subjectWiseQuestion[q.subject].push(temp)
                    subjects.push(q.subject)
                }
            })

            question_json = {
                questions: subjectWiseQuestion[subjects[0]]
            }
            let m = questionsToDisplay % subjects.length;
            let rQ = (questionsToDisplay - m) / subjects.length;

            if (subjects.length > 1) {
                this.mSD[parameters._id] = {
                    subjects: subjects,
                    subjectWiseQuestion: subjectWiseQuestion,
                    activeSubjectIndex: 0,
                    attemptedQuestion: 0,
                    qfirst: rQ,
                    qlast: rQ + m
                }
            }

            await this.questionFormPythonApi(req, 'firstQuestion', question_json, autoGenerated, parameters)

            if (!autoGenerated) {
                await this.updateTestAttendance(req, practicesetId)
            }
            return;
        } catch (error) {
            Logger.error(error);
            throw new InternalServerErrorException(error.message);
        }
    }

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

    // It takes answers of previous question, 
    // verifies it and return the next question on the basis of correctness.
    async getNextQuestion(req: GetNextQuestionRequest) {
        try {
            if (!req.body.testId) {
                throw new PreconditionFailedException('Pass valid parameters.');
            }

            if (!req.body.question || !req.body.attempt) {
                throw new BadRequestException('Pass Attempt-ID, Question-ID and Answer-IDs.');
            }

            var finish = parseInt(req.body.finish)
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            let resp = await this.practiceSetRepository.findOne({
                _id: new ObjectId(req.body.testId)
            }, {
                questions: 1,
                totalQuestion: 1,
                questionsToDisplay: 1,
                testType: 1,
                isMarksLevel: 1,
                minusMark: 1,
                plusMark: 1,
                totalTime: 1,
                user: 1,
                requireAttendance: 1
            }, { lean: true })

            if (!resp) {
                throw new InternalServerErrorException('Internal error...');
            }

            let userAnswers = req.body.answers || []
            
            this.questionRepository.setInstanceKey(req.instancekey);
            let prevQuestion = await this.questionRepository.findOne({
                _id: req.body.question
            }, null, { lean: true })

            if (!prevQuestion) {
                throw new PreconditionFailedException('Pass valid parameters.');
            }

            let answers = prevQuestion.answers;
            let userAnswerCount = 0
            let correctAnswer = false;

            if (prevQuestion.category == 'fib') {
                userAnswers.forEach(function (userAnswer) {
                    answers.forEach(function (actualAnswer) {
                        if (String(userAnswer.answerId) == String(actualAnswer._id)) {
                            if (fibAnswerCompare(actualAnswer, userAnswer)) {
                                userAnswerCount++;
                            }
                        }
                    })
                })

                if (userAnswerCount == prevQuestion.answers.length) {
                    correctAnswer = true
                }
            } else if (prevQuestion.category == 'code') {
                let hasWrongAnswer = false;
                let codeData = _.find(prevQuestion.coding, {
                    language: userAnswers[0].codeLanguage
                });
                if (codeData) {
                    hasWrongAnswer = false;

                    // Check user testcases output to find correct answer
                    prevQuestion.testcases.forEach(function (testcase) {
                        let userCase = _.find(userAnswers[0].testcases, utc => {
                            let isTheCase = true
                            if (prevQuestion.hasArg) {
                                isTheCase = utc.args == testcase.args
                            }
                            if (isTheCase && prevQuestion.hasUserInput) {
                                isTheCase = utc.input == testcase.input
                            }

                            return isTheCase;
                        });
                        if (userCase) {
                            if (!userCase.output || userCase.output.trimRight() !== testcase.output) {
                                userCase.status = false;
                                hasWrongAnswer = true;
                            } else {
                                userCase.status = true;
                            }
                        } else {
                            if (userAnswers[0].testcases) {
                                // Only log this if user has run the code but the testcases does not matched 
                                Logger.warn('userCase not found for question %s - language %s - testcase %j - user answer %j',
                                    prevQuestion._id.toString(), userAnswers[0].codeLanguage, testcase, userAnswers[0])
                            }

                            hasWrongAnswer = true;
                        }
                    })
                } else {
                    // Logger.warn('codeData not found for question %s - language %s', prevQuestion._id.toString(), userAnswerLookup[qId].answers[0].codeLanguage)
                }
                if (!hasWrongAnswer) {
                    correctAnswer = true
                }
            } else if (prevQuestion.category == 'descriptive') {
                //  pending = pending + 1;
                // isEvaluated = false;
                // hasWrongAnswer = true;
            } else if (prevQuestion.category == 'mcq') {
                let answerCorrect = [];
                for (let c of prevQuestion.answers) {
                    if (c.isCorrectAnswer) {
                        answerCorrect.push(c._id.toString());
                    }
                }

                correctAnswer = _.difference(answerCorrect, userAnswers).length == 0
            } else if (prevQuestion.category == 'mixmatch') {
                const match = []
                answers.forEach(function (actualAnswer, i) {
                    // const index = userAnswerLookup[qId].answers.findIndex(a => a.answerText == actualAnswer.answerText)
                    // const correctMatch = mixmatchAnswerCompare(actualAnswer, userAnswers[index])
                    // match.push(correctMatch);
                })
                correctAnswer = !match.includes(false)
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let attempt = await this.attemptRepository.findOne({
                _id: req.body.attempt
            })
            attempt = await this.attemptRepository.populate(attempt, {
                path: 'attemptdetails',
                select: '-_id QA'
            })

            if (!attempt) {
                throw new NotAcceptableException('Attempt does not exist with given ID.')
            }

            var subs = attempt.subjects.slice()
            subs = subs === null ? [] : subs
            attempt = this.removeAttemptDetails(attempt)
            // It will contain the question ids of all the previously attempted questions of this set.
            var questionsPresented = []
            if (!attempt.QA) {
                attempt.QA = [];
            }
            for (var x = 0; x < attempt.QA.length; x++) {
                questionsPresented.push(attempt.QA[x].question)
            }

            // To check if this question is already attemted and client is trying to attempt it again.
            // var isInArray = questionsPresented.some(function (ques) {
            //     return ques.equals(prevQuestion._id)
            // })
            // if (isInArray)
            //  return callback({ 'status': 406, 'error': 'This question has already been attempted.' })

            // object to store inside QA field.
            var ques: any = {}
            ques.topic = prevQuestion.topic
            ques.subject = prevQuestion.subject
            ques.unit = prevQuestion.unit

            if (prevQuestion.tComplexity) {
                ques.tComplexity = prevQuestion.tComplexity;
            } else {
                if (prevQuestion.complexity === 'easy')
                    ques.tComplexity = 0.2;
                else if (prevQuestion.complexity === 'moderate')
                    ques.tComplexity = 0.5;
                else
                    ques.tComplexity = 0.8
            }

            if (req.body.category) {
                ques.category = req.body.category
            } else {
                ques.category = 'mcq'
            }

            ques.answers = [];

            if (req.body.answers.length > 0) {
                if (req.body.category === 'mcq') {
                    ques.answers = req.body.answers.map(a => {
                        return { answerId: a }
                    });
                } else if (req.body.category === 'fib') {
                    ques.answers = req.body.answers;
                } else if (req.body.category === 'code') {
                    ques.answers = req.body.answers;
                } else if (req.body.category === 'rearrange') {
                    if (req.body.answers.length > 0) {
                        ques.answers = req.body.answers.map((d) => {
                            return {
                                answerId: d
                            }
                        });
                    }
                } else if (req.body.category === 'mixmatch') {
                    ques.answers = req.body.answers;
                } else if (req.body.category == 'descriptive') {
                    ques.answers = req.body.answers;
                }
            }

            ques.question = prevQuestion._id
            if (req.body.scratchPad) {
                ques.scratchPad = req.body.scratchPad
            }
            if (userAnswers.length == 0)
                ques.isMissed = true

            if (req.body.qSpendTime) {
                ques.timeEslapse = req.body.qSpendTime
            }

            var QAlen = (attempt.QA).length

            if (QAlen == 0) {
                // ques.createdAt = new Date((new Date(attempt.createdAt)).getTime() + req.body.qSpendTime)
            } else {
                // ques.createdAt = new Date((new Date(attempt.QA[QAlen - 1].createdAt)).getTime() + req.body.qSpendTime)
            }

            // It will always be 0 in case of adaptive tests.
            ques.answerChanged = 0
            if (String(resp.user) != String(req.user._id) && resp.isMarksLevel) {
                ques.actualMarks = resp.plusMark
            } else {
                ques.actualMarks = prevQuestion.plusMark
            }

            ques.minusMark = prevQuestion.minusMark
            if (req.body.feedback == 'true') {
                ques.feedback = true;
            }

            //#region update subject/unit/topic
            var totalMark = attempt.totalMark
            var plusMark = attempt.plusMark
            var minusMark = attempt.minusMark
            var totalMissed = attempt.totalMissed
            var totalErrors = attempt.totalErrors
            var totalTime = attempt.totalTime + ques.timeEslapse
            var totalCorrects = attempt.totalCorrects
            var totalQuestions = attempt.totalQuestions + 1

            var maximumMarks = attempt.maximumMarks
            if (String(resp.user) != String(req.user._id) && resp.isMarksLevel) {
                maximumMarks += resp.plusMark;
            } else {
                maximumMarks += prevQuestion.plusMark
            }

            if (userAnswers.length == 0) {
                ques.status = 3
                totalMissed += 1
                ques.obtainMarks = 0
            } else if (correctAnswer) {
                if (String(resp.user) != String(req.user._id) && resp.isMarksLevel) {
                    plusMark += resp.plusMark
                    totalMark += resp.plusMark
                    ques.obtainMarks = resp.plusMark
                } else {
                    plusMark += prevQuestion.plusMark
                    totalMark += prevQuestion.plusMark
                    ques.obtainMarks = prevQuestion.plusMark
                }
                ques.status = 1
                totalCorrects += 1

            } else {
                ques.status = 2
                totalErrors += 1

                if (String(resp.user) != String(req.user._id) && resp.isMarksLevel) {
                    minusMark += resp.minusMark
                    ques.obtainMarks = resp.minusMark
                    totalMark += resp.minusMark
                } else {
                    minusMark += prevQuestion.minusMark
                    totalMark += prevQuestion.minusMark
                    ques.obtainMarks = prevQuestion.minusMark
                }
            }

            // Create Subjects
            for (var i = 0; i < subs.length; i++) {
                let sub = subs[i]
                if (sub._id.equals(prevQuestion.subject._id))
                    break
            }
            if (i >= subs.length) {
                var addSubject = {
                    _id: prevQuestion.subject._id,
                    name: prevQuestion.subject.name,
                    units: [],
                    accuracy: 0,
                    speed: 0,
                    mark: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    maxMarks: 0
                }
                subs.push(addSubject)
            }

            for (var j = 0; j < subs[i].units.length; j++) {
                let top = subs[i].units[j]
                if (top._id.equals(prevQuestion.unit._id))
                    break
            }

            if (j >= subs[i].units.length) {
                var addUnit = {
                    _id: prevQuestion.unit._id,
                    name: prevQuestion.unit.name,
                    topics: [],
                    accuracy: 0,
                    speed: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    mark: 0,
                    maxMarks: 0
                }
                subs[i].units.push(addUnit)
            }

            for (var k = 0; k < subs[i].units[j].topics.length; k++) {
                let top = subs[i].units[j].topics[k]
                if (top._id.equals(prevQuestion.topic._id))
                    break
            }

            if (k >= subs[i].units[j].topics.length) {
                subs[i].units[j].topics.push({
                    _id: prevQuestion.topic._id,
                    name: prevQuestion.topic.name,
                    accuracy: 0,
                    speed: 0,
                    incorrect: 0,
                    missed: 0,
                    correct: 0,
                    mark: 0,
                    maxMarks: 0
                })
            }

            if (ques.status === 1) {
                subs[i].correct += 1
                subs[i].units[j].correct += 1
                subs[i].units[j].topics[k].correct += 1
            }
            if (ques.status === 2) {
                subs[i].incorrect += 1
                subs[i].units[j].incorrect += 1
                subs[i].units[j].topics[k].incorrect += 1
            }
            if (ques.status === 3) {
                subs[i].missed += 1
                subs[i].units[j].missed += 1
                subs[i].units[j].topics[k].missed += 1
            }
            subs[i].mark += ques.obtainMarks
            subs[i].maxMarks += ques.actualMarks
            subs[i].accuracy = subs[i].maxMarks > 0 ? subs[i].mark / subs[i].maxMarks : 0
            subs[i].speed = (((subs[i].speed) * (subs[i].correct + subs[i].incorrect - 1)) + ques.timeEslapse) / (subs[i].correct + subs[i].incorrect)

            subs[i].units[j].mark += ques.obtainMarks
            subs[i].units[j].maxMarks += ques.actualMarks
            subs[i].units[j].accuracy = subs[i].units[j].maxMarks > 0 ? subs[i].units[j].mark / subs[i].units[j].maxMarks : 0
            subs[i].units[j].speed = (((subs[i].units[j].speed) * (subs[i].units[j].correct + subs[i].units[j].incorrect - 1)) + ques.timeEslapse) / (subs[i].units[j].correct + subs[i].units[j].incorrect)

            subs[i].units[j].topics[k].mark += ques.obtainMarks
            subs[i].units[j].topics[k].maxMarks += ques.actualMarks
            subs[i].units[j].topics[k].accuracy = subs[i].units[j].topics[k].maxMarks > 0 ? subs[i].units[j].topics[k].mark / subs[i].units[j].topics[k].maxMarks : 0
            subs[i].units[j].topics[k].speed = (((subs[i].units[j].topics[k].speed) * (subs[i].units[j].topics[k].correct + subs[i].units[j].topics[k].incorrect - 1)) + ques.timeEslapse) / (subs[i].units[j].topics[k].correct + subs[i].units[j].topics[k].incorrect)

            //#endregion update subject/unit/topic

            var fieldsToSet = {
                'totalMark': totalMark,
                'plusMark': plusMark,
                'minusMark': minusMark,
                'totalMissed': totalMissed,
                'totalErrors': totalErrors,
                'totalTime': totalTime,
                'totalCorrects': totalCorrects,
                'updatedAt': new Date(),
                'totalQuestions': totalQuestions,
                'subjects': subs,
                'maximumMarks': maximumMarks
            }

            this.attemptRepository.setInstanceKey(req.instancekey);
            let atmDoc = await this.attemptRepository.findOneAndUpdate({
                _id: req.body.attempt
            }, {
                $set: fieldsToSet
            }, {
                new: true
            })
            this.attemptDetailRepository.setInstanceKey(req.instancekey);
            let details = await this.attemptDetailRepository.findOneAndUpdate({
                attempt: new ObjectId(req.body.attempt)
            }, {
                $push: {
                    QA: ques
                }
            }, {
                new: true
            })

            var totalTime = resp.totalTime

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
            await this.attemptDetailRepository.findByIdAndUpdate(details._id, details)

            let nextQues = {
                'status': 202,
                'practiceset': attempt.practicesetId,
                'adaptiveTest': attempt.practiceSetInfo.adaptiveTest,
                'questionsAttempted': atmDoc.totalQuestions,
                'previousResponse': ques
            }

            var index = parseInt(req.body.index)
            var adaptiveObject = req.body.adaptiveObject
            var jsonObject = {
                'correct': correctAnswer,
                'object': adaptiveObject,
                'index': index
            }

            if (!nextQues.questionsAttempted) {
                nextQues.questionsAttempted = 1;
            }

            if (!finish && resp && nextQues.questionsAttempted < resp.questionsToDisplay) {
                var questions = resp.questions
                questions.plusMark = resp.plusMark
                questions.minusMark = resp.minusMark
                var parameters = {
                    _id: resp._id,
                    questions: questions,
                    attemptID: new ObjectId(req.body.attempt),
                    previousResponse: nextQues.previousResponse
                }
                var autoGenerated = String(resp.user) == String(req.user._id);

                this.questionFormPythonApi(req, 'nextQuestion', jsonObject, autoGenerated, parameters)
            } else if (finish || (resp && nextQues.questionsAttempted >= resp.questionsToDisplay)) {

                atmDoc.isAbandoned = false;
                await this.attemptRepository.findByIdAndUpdate(atmDoc._id, atmDoc);
                details.isAbandoned = false;
                await this.attemptDetailRepository.findByIdAndUpdate(details._id, details)

                this.attemptProcessor.updateUserLevel(req.instancekey, atmDoc)



                // update attendance
                const attendance = await this.attendanceRepository.findOne({
                    practicesetId: atmDoc.practicesetId,
                    studentId: atmDoc.user
                })
                if (attendance) {
                    if (atmDoc.isAbandoned) {
                        attendance.status = 'abandoned'
                    } else {
                        attendance.status = 'finished'
                    }

                    await this.attendanceRepository.findByIdAndUpdate(attendance._id, attendance);
                    if (resp.requireAttendance) {
                        // socketServer.toUser(req.headers.instancekey, attendance.teacherId, 'attendance.update', {
                        //     studentId: attendance.studentId.toString(),
                        //     status: attendance.status,
                        //     admitted: attendance.admitted
                        // });
                    } else {
                        // socketServer.toTestRoom(req.headers.instancekey, atmDoc.practicesetId, 'test.finish', {
                        //     studentId: attendance.studentId.toString(),
                        //     status: attendance.status
                        // })
                    }
                    
                    return {
                        'status': 202,
                        'message': 'Adaptive Test is over for you.',
                        previousResponse: nextQues.previousResponse
                    }
                }
            } else {
                throw new PreconditionFailedException('Pass valid parameters.');
            }
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    // To retrieve the adaptive practice set along with creater of that practice set.
    async getAdaptiveTest(req: GetAdaptiveTestRequest) {
        try {            
            this.practiceSetRepository.setInstanceKey(req.instancekey);
            var adaptiveTest = await this.practiceSetRepository
                .findOne({
                    _id: new ObjectId(req.id)
                })
            adaptiveTest = await this.practiceSetRepository.populate(adaptiveTest, { path: 'user', select: '-salt -hashedPassword' })
            
            return { response: adaptiveTest };
        } catch (error) {
            Logger.error(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}