import { Injectable, Logger } from "@nestjs/common";
import { AttemptDetail, AttemptDetailRepository, AttemptRepository, ClassroomRepository, Competencies, CompetenciesRepository, Content, CourseRepository, NotificationRepository, PracticeSetRepository, QuestionRepository, SubjectRepository, UserCourseRepository, UsersRepository } from "../database";
import { RedisCaching } from "../services";
import { codingAnswerCompare, codingPartialMark, fibAnswerCompare, mixmatchAnswerCompare } from "../helpers/attempt";
import { _ } from 'lodash'
import { Constants } from "../helpers";
import { round } from "../Utils";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { config } from "../config";
import axios from "axios";
import { S3Service } from "./aws/s3.service";
import { SocketClientService } from "../socket";
import { MessageCenter } from "./messageCenter";


@Injectable()
export class AttemptProcessor {
    constructor(
        private readonly attemptRepository: AttemptRepository,
        private readonly redisCache: RedisCaching,
        private readonly practicesetRepository: PracticeSetRepository,
        private readonly questionRepository: QuestionRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly attemptDetailRepository: AttemptDetailRepository,
        private readonly usersRepository: UsersRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly competenciesRepository: CompetenciesRepository,
        private readonly userCourseRepository: UserCourseRepository,
        private readonly courseRepository: CourseRepository,
        private readonly notificationRepository: NotificationRepository,
        private readonly s3Service: S3Service,
        private readonly socketClientService: SocketClientService,
        private readonly messageCenter: MessageCenter,
    ) { }

    async proadapt(settings, user, attempt) {
        let provider = settings.ssoConfig.find(d => d.clientID == user.provider)
        let apiInfo = provider.apis.find(d => d.key == 'generate_token');

        let reqBody = {
            authUrl: apiInfo.url,
            grantType: apiInfo.data_fields.grant_type,
            clientID: apiInfo.data_fields.client_id,
            clientSecret: apiInfo.data_fields.client_secret
        };
        let response: any = await axios.post(reqBody.authUrl, new URLSearchParams({
            grant_type: reqBody.grantType
        }), {
            auth: {
                username: reqBody.clientID,
                password: reqBody.clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        var json = JSON.parse(response.body)
        apiInfo = provider.apis.find(d => d.key == 'get_userId');

        let data = { url: apiInfo.url.replace('userId', attempt.userId) }

        let res: any = await axios.get(data.url, {
            headers: { Authorization: 'Bearer ' + json.access_token }
        })

        let body = JSON.parse(res.body)

        if (body && body.userId) {
            let apiInfo = provider.apis.find(d => d.key == 'update_progress');

            let testinfo = provider.activities.find(d => d.testCode == attempt.testCode);

            data.url = apiInfo.url.replace('activityId', testinfo.activityId).replace('userId', body.userId)

            let res: any = await axios.patch(
                data.url, {
                headers: { Authorization: 'Bearer ' + json.access_token },
                json: true, // <--Very important!!!
                body: {
                    "status": attempt.isAbandoned ? "Inprogress" : 'Attended',
                    "statusDate": attempt.createdAt,
                    "score": (attempt.totalMark / attempt.maximumMarks) * 100,
                    "elapsedSeconds": attempt.totalTime
                }
            }
            )
            if (body) {
                Logger.debug("prodapt response ok")
            } else {
                Logger.debug("prodapt no response")
            }

        }
    }

    async updateSectionAnalytics(ik, section, userCourse) {
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
                        let attempt = await this.attemptRepository.findById(new Types.ObjectId(attContent.attempt))
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

        userSec.analytics.quiz - quiz ? round((quizCompleted / quiz) * 100, 0, 100) : 0;
        userSec.analytics.test = test ? round((testAtm / test) * 100, 0, 100) : 0;
        userSec.analytics.attempt = quiz + test ? round((attemptC / (quiz + test)) * 100, 0, 100) : 0;
        userSec.analytics.accuracy = attemptC ? round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.accuracy = attemptC ? round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.accuracy = attemptC ? round((attemptAccuracy * 100) / attemptC, 2, 100) : 0;
        userSec.analytics.mark = mark;
        userSec.analytics.maxMark = maxMark;
    }

    async updateUserCourse(ik, userId, courseContent, attempt) {
        try {
            this.userCourseRepository.setInstanceKey(ik)
            let uc = await this.userCourseRepository.findOneAndUpdate(
                {
                    user: userId, course: courseContent.course,
                    'contents._id': courseContent.content
                },
                {
                    $set: { 'contents.$.completed': true, 'contents.$.attempt': attempt._id, 'content.$.end': new Date() },
                    $inc: { 'contents.$.timeSpent': attempt.totalTime }
                },
                { new: true }
            )
            if (uc) {
                let completedContents = uc.contents.filter(c => c.c.completed);
                this.courseRepository.setInstanceKey(ik)
                let course: any = await this.courseRepository.findById(uc.course)

                let finished = true;
                for (let sec of course.sections) {
                    for (let content of sec.contents) {
                        if (content.active) {
                            if (content._id.equals(courseContent.content)) {
                                await this.updateSectionAnalytics(ik, sec, uc)
                            }
                            let f = completedContents.findIndex(c => c._id.equals(content._id))
                            if (f == -1) {
                                finished = false
                            }
                        }
                    }
                }

                if (finished) {
                    uc.completed = true;
                }

                await this.userCourseRepository.updateOne(uc._id, uc);
            }
        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }

    async createArchiveAttemptAndAttemptDetails(ik, attempt, practice) {
        this.attemptDetailRepository.setInstanceKey(ik)
        let attemptData = await this.attemptDetailRepository.findById(attempt.attemptdetails, { QA: 1 })

        let QA = attemptData.QA;
        let newQA = [];
        let totalCorrects = 0;
        let totalErrors = 0;
        let totalMark = 0;
        let pending = 0;
        let plusMark = 0;
        let partial = 0
        let minusMark = 0;
        let maximumMarks = 0;
        let totalQuestions = 0;
        let missed = 0;

        let hasOptionalQuestion = []

        hasOptionalQuestion = practice.sections.filter(d => d.optionalQuestions > 0)

        if (hasOptionalQuestion.length > 0) {
            if (practice.sections.length > 0) {
                for (let section of practice.sections) {
                    let secQuestions = []

                    practice.questions.forEach(q => {
                        if (q.section == section.name) {
                            secQuestions.push(String(q.question))
                        }
                    })

                    let sectionQA = []

                    sectionQA = QA.filter(qa => secQuestions.indexOf(String(qa.question)) !== -1)

                    sectionQA.sort((a, b) => {
                        let isMissedQA = a.isMissed - b.isMissed;
                        if (isMissedQA) {
                            return isMissedQA;
                        }

                        let obtainMarksQA = b.obtainMarks - a.obtainMarks;
                        if (obtainMarksQA) {
                            return obtainMarksQA
                        }
                        return 0;
                    })

                    //exclude optional questions
                    sectionQA.splice(sectionQA.length - section.optionalQuestions, section.optionalQuestions)

                    //Re-assign remaining Questions
                    newQA = newQA.concat(sectionQA);


                    for (let k = 0; k < section.subjects.length; k++) {
                        let tampSecQA = sectionQA.filter(d => d.subject._id == String(section.subjects[k]));

                        let subjects = attempt.subjects.filter(s => s._id == String(section.subjects[k]))

                        subjects.forEach(d => {
                            d.accuracy = 0;
                            d.maxMarks = 0;
                            d.mark = 0;
                            d.partial = 0;
                            d.correct = 0;
                            d.missed = 0;
                            d.pending = 0;
                            d.incorrect = 0;
                            d.units.forEach(u => {
                                u.accuracy = 0;
                                u.incorrect = 0;
                                u.maxMarks = 0;
                                u.mark = 0;
                                u.partial = 0;
                                u.correct = 0;
                                u.missed = 0;
                                u.pending = 0;
                                u.topics.forEach(t => {
                                    t.accuracy = 0;
                                    t.incorrect = 0;
                                    t.maxMarks = 0;
                                    t.mark = 0;
                                    t.partial = 0;
                                    t.correct = 0;
                                    t.missed = 0;
                                    t.pending = 0;
                                })
                            })
                        })

                        for (let i = 0; i < tampSecQA.length; i++) {
                            let question = tampSecQA[i]
                            let m = -1
                            subjects[k].topics.forEach((t, index) => {
                                if (String(t._id) == String(question.topic._id)) {
                                    m = index
                                }
                            })

                            let unit = subjects[k].units.find(u => u._id.equals(question.unit._id))
                            let topic = unit.topics.find(t => t._id.equals(question.topic._id))

                            if (question.status === 1) {
                                totalCorrects++;
                                subjects[k].correct++;
                                unit.correct++;
                                topic.correct++;
                                plusMark = plusMark + question.obtainMarks;
                            } else if (question.status === 2) {
                                subjects[k].incorrect++;
                                unit.incorrect++;
                                topic.incorrect++;
                                totalErrors++;
                                minusMark = minusMark + question.obtainMarks;
                            } else if (question.status === 4) {
                                subjects[k].pending++;
                                unit.pending++;
                                topic.pending++;
                                pending++
                            } else if (question.status === 5) {
                                subjects[k].partial++;
                                unit.partial++;
                                topic.partial++;
                                plusMark = plusMark + question.obtainMarks;

                                partial++;
                            } else {
                                subjects[k].missed++
                                unit.missed++
                                topic.missed++
                                missed++

                            } totalQuestions += 1;
                            totalMark = totalMark + question.obtainMarks
                            maximumMarks = maximumMarks + question.actualMarks;

                            subjects[k].mark += question.obtainMarks
                            subjects[k].maxMarks += question.actualMarks
                            subjects[k].accuracy = subjects[k].maxMarks > 0 ? subjects[k].mark / subjects[k].maxMarks : 0

                            unit.mark += question.obtainMarks
                            unit.maxMarks += question.actualMarks
                            unit.accuracy = unit.maxMarks > 0 ? unit.mark / unit.maxMarks : 0

                            topic.mark += question.obtainMarks
                            topic.maxMarks += question.actualMarks
                            topic.accuracy = topic.maxMarks > 0 ? topic.mark / topic.maxMarks : 0
                        }
                    }
                }
            }

            this.attemptRepository.setInstanceKey(ik);
            await this.attemptRepository.updateOne({ _id: attempt._id }, {
                $set: {
                    totalCorrects: totalCorrects,
                    totalErrors: totalErrors,
                    totalMark: totalMark,
                    pending: pending,
                    plusMark: plusMark,
                    totalMissed: missed,
                    totalQuestions: totalQuestions,
                    partial: partial,
                    minusMark: minusMark,
                    maximumMarks: maximumMarks,
                    subjects: attempt.subjects
                }
            })
            newQA.sort((a, b) => {
                return b.stdTime - a.stdTime
            })

            this.attemptDetailRepository.setInstanceKey(ik);
            await this.attemptDetailRepository.updateOne({ _id: attempt.attemptdetails },
                {
                    $set: {
                        QA: newQA,
                        archiveQA: QA
                    }
                }
            )
        }
    }

    async markEvaluationPending(ik, attempt) {
        for (let i = 0; i < attempt.subjects.length; i++) {
            attempt.subjects[i].pending = attempt.subjects[i].incorrect + attempt.subjects[i].correct + attempt.subjects[i].partial + attempt.subjects[i].pending
            attempt.subjects[i].mark = 0
            attempt.subjects[i].partial = 0
            attempt.subjects[i].accuracy = 0
            attempt.subjects[i].incorrect = 0
            attempt.subjects[i].correct = 0
            for (let j = 0; j < attempt.subjects[i].units.length; j++) {
                attempt.subjects[i].units[j].pending = attempt.subjects[i].units[j].incorrect + attempt.subjects[i].units[j].correct + attempt.subjects[i].units[j].partial
                attempt.subjects[i].units[j].mark = 0
                attempt.subjects[i].units[j].partial = 0
                attempt.subjects[i].units[j].accuracy = 0
                attempt.subjects[i].units[j].incorrect = 0
                attempt.subjects[i].units[j].correct = 0
                for (let k = 0; k < attempt.subjects[i].units[j].topics.length; k++) {
                    attempt.subjects[i].units[j].topics[k].pending = attempt.subjects[i].units[j].topics[k].incorrect + attempt.subjects[i].units[j].topics[k].correct + attempt.subjects[i].units[j].topics[k].partial
                    attempt.subjects[i].units[j].topics[k].mark = 0
                    attempt.subjects[i].units[j].topics[k].partial = 0
                    attempt.subjects[i].units[j].topics[k].accuracy = 0
                    attempt.subjects[i].units[j].topics[k].incorrect = 0
                    attempt.subjects[i].units[j].topics[k].correct = 0
                }
            }
        }
        this.attemptRepository.setInstanceKey(ik);
        await this.attemptRepository.updateOne({ _id: attempt._id },
            {
                $set: {
                    totalCorrects: 0, totalErrors: 0,
                    totalMark: 0, pending: attempt.totalCorrects + attempt.totalErrors, plusMark: 0, minusMark: 0,
                    isEvaluated: false, subjects: attempt.subjects
                }
            }
        )

        this.attemptDetailRepository.setInstanceKey(ik);
        let attemptDetail = await this.attemptDetailRepository.findById(attempt.attemptDetails, { QA: 1 })

        for (let i = 0; i < attemptDetail.QA.length; i++) {
            if (attemptDetail.QA[i].status != 3) {
                attemptDetail.QA[i].status = 4
            }
        }

        await this.attemptDetailRepository.findByIdAndUpdate(attemptDetail._id, attemptDetail)

    }

    async updateUserLevel(ik, attempt) {
        var userSubjectLevel = {};
        var currentSubjectLevelInfo = {};
        var nextLevelCriteria = {}

        this.usersRepository.setInstanceKey(ik)
        let user = await this.usersRepository.findById(attempt.user)

        for (var i = 0; i < user.levelHistory.length; i++) {
            if (attempt.subjects.find(s => s._id.equals(user.levelHistory[i].subjectId))) {
                userSubjectLevel[user.levelHistory[i].subjectId.toString()] = {
                    level: user.levelHistory[i].level,
                    updateDate: user.levelHistory[i].updateDate,
                    maxLevel: 5
                }
            }
        }
        this.subjectRepository.setInstanceKey(ik)
        let srcSubjects = await this.subjectRepository.find({
            _id: { $in: Object.keys(userSubjectLevel) }, 'levels.0': {
                $exists: true
            }
        })

        if (!srcSubjects.length) {
            return
        }

        for (let s of srcSubjects) {
            let maxLevel = s.levels.length
            userSubjectLevel[s._id.toString()].maxLevel = maxLevel;
            if (userSubjectLevel[s._id.toString()].level < maxLevel) {
                for (let level of s.levels) {
                    if (level.value == userSubjectLevel[s._id.toString()].level) {
                        if (level.quantity > 0 || level.quality > 0) {
                            currentSubjectLevelInfo[s._id.toString()] = {
                                _id: s._id,
                                name: s.name,
                                quantity: level.quantity,
                                quality: level.quality,
                                level: level.vale,
                                maxLevel: maxLevel
                            }
                        }
                    } else if (level.value == (userSubjectLevel[s._id.toString()].level + 1)) {
                        if (level.quantity > 0 || level.quality > 0) {
                            nextLevelCriteria[s._id.toString()] = {
                                _id: s._id,
                                name: s.name,
                                quantity: level.quantity,
                                quality: level.quality
                            }
                        }
                    }
                }
            }
        }
        if (Object.keys(currentSubjectLevelInfo).length == 0) {
            return;
        }

        var condition = {
            user: user._id,
            isEvaluated: true,
            isLevelReset: false,
            partiallyAttempted: false,
            $or: []
        };

        for (let sub in currentSubjectLevelInfo) {
            condition.$or.push(
                {
                    'subjects._id': currentSubjectLevelInfo[sub]._id,
                    'practiceSetInfo.level': currentSubjectLevelInfo[sub].level
                }
            )
        }

        let attemptSubjectInfo: any = await this.attemptRepository.aggregate([
            {
                $match: condition
            },
            {
                $sort: { totalMark: -1 }
            },
            {
                $group: {
                    _id: "$practicesetId",
                    user: {
                        $first: '$user'
                    },
                    attemptdetails: {
                        $first: '$attemptdetails'
                    }
                }
            },
            {
                $lookup: {
                    from: "attemptdetails",
                    localField: "attemptdetails",
                    foreignField: "_id",
                    as: "someField"
                }
            },
            {
                $unwind: "$someField"
            },
            {
                $addFields: {
                    QA: "$someField.QA"
                }
            },
            {
                $project: {
                    someField: 0
                }
            },
            {
                $unwind: '$QA'
            },
            {
                $group: {
                    _id: "$QA.subject._id",
                    subjectName: {
                        $first: '$QA.subject.name'
                    },
                    user: {
                        $first: '$user'
                    },
                    questionCount: {
                        $sum: {
                            $cond: [{
                                $eq: ["$QA.status", 3]
                            }, 0, 1]
                        }
                    },
                    totalQuestion: {
                        $sum: 1
                    },
                    correctQuestion: {
                        $sum: {
                            $cond: [{
                                $eq: ["$QA.status", 1]
                            }, 1, 0]
                        }
                    },
                    totalMark: {
                        $sum: "$QA.actualMarks"
                    },
                    obtainMark: {
                        $sum: "$QA.obtainMarks"
                    }
                }
            },
            {
                $project: {
                    name: '$subjectName',
                    subjectId: '$_id',
                    attemptedQuestion: '$questionCount',
                    accuracy: {
                        $multiply: [{
                            $cond: [{
                                $eq: ["$totalMark", 0]
                            }, 0, {
                                "$divide": ["$obtainMark", "$totalMark"]
                            }]
                        }, 100]
                    },
                    totalQuestion: 1,
                    correctQuestion: 1
                }
            }
        ])

        for (let currentSubQQ of attemptSubjectInfo) {
            if (currentSubjectLevelInfo[currentSubQQ.subjectId]) {
                let canUpgrade = currentSubQQ.attemptedQuestion >= currentSubjectLevelInfo[currentSubQQ.subjectId].quantity && currentSubQQ.accuracy >= currentSubjectLevelInfo[currentSubQQ.subjectId].quality

                await this.updateCompetenciesInfo(ik, user, attempt, canUpgrade, currentSubjectLevelInfo[currentSubQQ.subjectId], currentSubQQ, nextLevelCriteria[currentSubQQ.subjectId])
            }
        }
    }

    async updateCompetenciesInfo(ik, user, attempt, canUpgrade, currentSubjectLevelInfo, subQuantityAndQuality, nextLevelCriteria) {
        this.competenciesRepository.setInstanceKey(ik)
        let competencies = await this.competenciesRepository.findOne({
            subjectId: currentSubjectLevelInfo._id,
            level: currentSubjectLevelInfo.level,
            userId: user._id
        })

        if (!competencies) {
            competencies = new Competencies()
            competencies.userId = user._id;
            competencies.subjectId = currentSubjectLevelInfo._id;
            competencies.subjectName = subQuantityAndQuality.name;
            competencies.level = currentSubjectLevelInfo.level
        }

        competencies.maxLevel = currentSubjectLevelInfo.maxLevel;
        competencies.attemptedQuestion = subQuantityAndQuality.attemptedQuestion;
        competencies.accuracy = subQuantityAndQuality.accuracy;
        competencies.totalQuestion = subQuantityAndQuality.totalQuestion;
        competencies.correctQuestion = subQuantityAndQuality.correctQuestion;
        competencies.updatedDate = new Date()

        competencies = await this.competenciesRepository.create(competencies)

        if (canUpgrade) {
            await this.competenciesRepository.updateOne({
                userId: user._id,
                subjectId: currentSubjectLevelInfo._id,
                level: currentSubjectLevelInfo.level + 1,
            },
                {
                    $set: {
                        subjectName: subQuantityAndQuality.name,
                        maxLevel: currentSubjectLevelInfo.maxLevel,
                        updatedDate: Date.now()
                    }
                },
                {
                    upsert: true
                })

            await this.upgradeUserLevel(ik, user, attempt, currentSubjectLevelInfo, nextLevelCriteria)
        }
    }

    async upgradeUserLevel(ik, user, attempt, currentSubjectLevelInfo, nextLevelCriteria) {
        let history = user.levelHistory.find(l => currentSubjectLevelInfo._id.equals(l.subjectId) && l.level == currentSubjectLevelInfo.level)
        if (history) {
            history.level = currentSubjectLevelInfo.level + 1
            history.updateDate = new Date()
        } else {
            user.levelHistory.push({
                subjectId: currentSubjectLevelInfo._id,
                level: currentSubjectLevelInfo.level + 1,
                updateDate: Date.now()
            })
        }
        this.usersRepository.setInstanceKey(ik)
        user = await this.usersRepository.findByIdAndUpdate(user._id, user)

        await this.notifyLevelUpgrade(ik, user, attempt, currentSubjectLevelInfo, nextLevelCriteria)
    }

    private async notifyLevelUpgrade(ik, user, attempt, currentSubjectLevelInfo, nextLevelCriteria) {
        await this.socketClientService.toUser(ik, user._id, 'level.update', { subjectId: currentSubjectLevelInfo._id, subjectName: currentSubjectLevelInfo.name, level: currentSubjectLevelInfo.level + 1 });

        await this.notificationRepository.create({
            receiver: new Types.ObjectId(user._id),
            type: 'notification',
            modelId: 'levelChanged',
            subject: 'Level Changed'
        });

        const options = {
            user: user,
            senderName: user.name,
            test: attempt.practiceSetInfo.title,
            level: currentSubjectLevelInfo.level + 1,
            levelCretaria: nextLevelCriteria,
            subject: 'Congratulations!!! You have unlocked next level of challenges'
        }

        const dataMsgCenter: any = { receiver: user._id, modelId: 'levelChanged' };

        if (user.email) {
            dataMsgCenter.to = user.email
            dataMsgCenter.isScheduled = true
        }

        this.messageCenter.send({ req: { instancekey: ik } }, 'level-upgrade.html', options, dataMsgCenter);
    }

    calculateTime(practice, attempt) {
        let totalTimeSecond = 0;
        let avgTimeSecond;
        let questions = attempt.QA;
        let totalSections = 0;

        totalTimeSecond = practice.totalTime * 60;
        avgTimeSecond = Number(totalTimeSecond / practice.totalQuestion).toFixed(0);

        if (practice.sectionTimeLimit) {
            let sectionIndex = [];

            totalTimeSecond = 0;

            questions.forEach(function (q) {
                let idx = _.findIndex(practice.questions, function (practiceQuestion) {
                    return practiceQuestion.question.equals(q.question)
                });

                if (idx > -1) {
                    q.section = practice.questions[idx].section;
                }

                for (let s = 0; s < practice.sections.length; s++) {
                    if (practice.sections[s].name === q.section) {
                        q.sectionIndex = s;
                        sectionIndex.push(s);
                        break;
                    }
                }
            })
            practice.sections.forEach(function (item, ind) {
                totalTimeSecond += item.time * 60;
            });

            totalSections = _.countBy(sectionIndex);

            avgTimeSecond = Number(practice.sections[0].time * 60 / totalSections[0]).toFixed(0);

            questions = _.sortBy(questions, function (obj) {
                return obj.sectionIndex;
            });
        }

        let lastTimeDo = 0;
        let totalTimeLeft = totalTimeSecond;
        let sdtTime = totalTimeSecond;

        let timeQ = []
        for (let i = 0; i < questions.length; i++) {
            totalTimeLeft -= lastTimeDo;

            lastTimeDo = questions[i].timeEslapse / 1000;

            if (i > 0) {
                sdtTime = sdtTime - avgTimeSecond;
                if (sdtTime < 0) {
                    sdtTime = 0;
                }
            }

            timeQ.push({
                index: i + 1,
                stdTime: sdtTime / 60,
                timeLeft: totalTimeLeft / 60
            })

            if (practice.sectionTimeLimit && questions[i].sectionIndex != null) {
                let sectionTimeSecond = practice.sections[questions[i].sectionIndex].time * 60;
                //average time in seconds to take a question in section
                avgTimeSecond = sectionTimeSecond / totalSections[questions[i].sectionIndex];
            }
        }
        return timeQ

    }
    async createAttemptAndAttemptDetails(ik, attemptData) {

        let subjects = []
        let subjectMap = {}
        let unitMap = {}
        let topicMap = {}

        if (Object.keys(attemptData).indexOf('QA') > -1) {

            for (let j = 0; j < attemptData.QA.length; j++) {
                let question = attemptData.QA[j]

                question.subject._id = new Types.ObjectId(question.subject._id)
                question.unit._id = new Types.ObjectId(question.unit._id)
                question.topic._id = new Types.ObjectId(question.topic._id)

                let subject = subjectMap[question.subject._id.toString()]

                if (!subject) {
                    subject = {
                        _id: question.subject._id,
                        name: question.subject.name,
                        units: [],
                        correct: 0,
                        missed: 0,
                        pending: 0,
                        incorrect: 0,
                        mark: 0,
                        speed: 0,
                        accuracy: 0,
                        offscreenTime: 0
                    }
                    subjectMap[question.subject._id.toString()] = subject
                    subjects.push(subject)
                }

                let unit = unitMap[question.unit._id.toString()]

                if (!unit) {
                    unit = {
                        _id: question.unit._id,
                        name: question.unit.name,
                        topics: [],
                        correct: 0,
                        missed: 0,
                        pending: 0,
                        incorrect: 0,
                        mark: 0,
                        speed: 0,
                        accuracy: 0,
                        offscreenTime: 0
                    }
                    unitMap[question.unit._id.toString()] = unit
                    subject.units.push(unit)
                }
                let topic = topicMap[question.topic._id.toString()]
                if (!topic) {
                    topic = {
                        _id: question.topic._id,
                        name: question.topic.name,
                        correct: 0,
                        missed: 0,
                        pending: 0,
                        incorrect: 0,
                        mark: 0,
                        speed: 0,
                        accuracy: 0,
                        offscreenTime: 0
                    }
                    topicMap[question.topic._id.toString()] = topic
                    unit.topics.push(topic)
                }

                if (question.status === 1) {
                    subject.correct++;
                    unit.correct++;
                    topic.correct++;
                } else if (question.status === 2) {
                    subject.incorrect++;
                    unit.incorrect++;
                    topic.incorrect++;
                } else if (question.status === 4) {
                    subject.pending++;
                    unit.pending++;
                    topic.pending++;
                } else {
                    subject.missed++;
                    unit.missed++;
                    topic.missed++;
                }

                if (question.offscreen && question.offscreen.length > 0) {
                    let offTime = 0
                    question.offscreen.forEach(t => offTime += t);
                    if (!attemptData.offscreenTime) {
                        attemptData.offscreenTime = 0
                    }
                    attemptData.offscreenTime += offTime
                }

                subject.speed += question.timeEslapse
                unit.speed += question.timeEslapse
                topic.speed += question.timeEslapse

                if (isNaN(question.obtainMarks))
                    question.obtainMarks = 0
                if (isNaN(question.actualMarks))
                    question.actualMarks = 0
                if (isNaN(question.plusMark))
                    question.plusMark = 0
                if (isNaN(question.minusMark))
                    question.minusMark = 0

                if (question.obtainMarks != undefined && question.actualMarks != undefined) {
                    subject.marks += question.obtainMarks
                    subject.accuracy += question.actualMarks

                    unit.mark += question.obtainMarks
                    unit.accuracy += question.actualMarks

                    topic.mark += question.obtainMarks
                    topic.accuracy += question.actualMarks
                } else {
                    let marks = 0
                    if (question.status === 1) {
                        marks = question.plusMark
                    } else if (question.status === 2) {
                        marks = question.minusMark
                    }
                    question.obtainMarks = marks
                    question.actualMarks = question.plusMark

                    subject.mark += marks
                    subject.accuracy += question.plusMark

                    unit.mark += marks
                    unit.accuracy += question.plusMark

                    topic.mark += marks
                    topic.accuracy += question.plusMark

                    delete question.plusMark
                    delete question.minusMark

                }
            }


            this.practicesetRepository.setInstanceKey(ik);
            let practice = await this.practicesetRepository.findOne({ _id: attemptData.practicesetId }, '-_id totalTime totalQuestion demographicData sectionTimeLimit sections questions isAdaptive requireAttendance')


            let attemptDetailsObj: any = (({
                user,
                practicesetId,
                QA
            }) => ({
                user,
                practicesetId,
                QA
            }))(attemptData)

            if (practice != null) {
                let timeArr = this.calculateTime(practice, attemptData)
                attemptDetailsObj.QA.forEach((question, index) => {
                    question.stdTime = timeArr[index].stdTime
                    question.timeLeft = timeArr[index].timeLeft
                    question.index = timeArr[index].index
                    if (question.answers) {
                        question.answers.forEach((answer, index) => {
                            if (ObjectId.isValid(answer)) {
                                question.answers[index] = {
                                    answerId: answer
                                }
                            }
                        })
                    } else {
                        question.answers = []
                    }
                })
            }
            if (['public', 'invitation', 'buy'].indexOf(attemptData.practiceSetInfo.accessMode) == -1) {
                attemptData.practiceSetInfo.accessMode = 'public'
            }
            delete attemptData.QA

            subjects.forEach(subject => {
                let qs = 0
                subject.units.forEach(unit => {
                    let uqs = 0
                    unit.topics.forEach(topic => {
                        let tqs = topic.correct + topic.incorrect + topic.missed + topic.pending
                        let dtqs = topic.correct + topic.incorrect + topic.pending
                        topic.maxMarks = topic.accuracy
                        if (topic.accuracy)
                            topic.accuracy = topic.mark / topic.accuracy
                        else
                            topic.accuracy = topic.correct / tqs
                        if (dtqs) {
                            topic.speed = topic.speed / dtqs
                        } else {
                            topic.speed = 0
                        }
                        topic.mark
                        uqs += tqs
                    })
                    let dqs = unit.correct + unit.incorrect + unit.pending
                    unit.maxMarks = unit.accuracy
                    if (unit.accuracy) {
                        unit.accuracy = unit.mark / unit.accuracy
                    } else {
                        unit.accuracy = unit.correct / uqs
                    }

                    if (dqs) {
                        unit.speed = unit.speed / dqs
                    } else {
                        unit.speed = 0
                    }

                    qs += uqs
                })

                let dqs = subject.correct + subject.incorrect + subject.pending
                subject.maxMarks = subject.accuracy

                if (subject.accuracy)
                    subject.accuracy = subject.mark / subject.accuracy
                else
                    subject.accuracy = subject.correct / qs
                if (dqs) {
                    subject.speed = subject.speed / dqs
                } else {
                    subject.speed = 0
                }
            })

            attemptData.subjects = [...subjects]
            attemptData.totalMark = attemptData.minusMark + attemptData.plusMark;
            this.attemptRepository.setInstanceKey(ik)
            let attemptReturn = await this.attemptRepository.findOneAndUpdate({ _id: new ObjectId(attemptData._id) }, attemptData, { new: true })

            if (practice) {
                if (practice.isAdaptive) {
                    attemptReturn.isAbandoned = false
                }

                attemptDetailsObj.attempt = attemptReturn._id
                attemptDetailsObj.isAbandoned = attemptReturn.isAbandoned

                if (attemptData._id) {

                    this.attemptDetailRepository.setInstanceKey(ik)
                    var adAftersave = await this.attemptDetailRepository.findOneAndUpdate({ attempt: attemptData._id }, attemptDetailsObj, { upsert: true, new: true })

                } else {
                    let atDetails = new AttemptDetail();
                    atDetails = attemptDetailsObj;
                    adAftersave = await this.attemptDetailRepository.create(atDetails)
                }
                attemptReturn.attemptdetails = adAftersave._id

                if (practice.demographicData.identityVerification) {
                    // if (user.identityInfo) {
                    //     attemptReturn.identityInfo = user.identityInfo;

                    // }
                }
                attemptReturn = await this.attemptRepository.findOneAndUpdate(attemptReturn._id, attemptReturn)
            }

            let newAttempt = attemptReturn

            if (!newAttempt.isAbandoned) {
                newAttempt.QA = attemptDetailsObj.QA;

                if (attemptData._id) {
                    newAttempt.isReset = true
                }
            }


            return newAttempt
        }
    }

    async handleNewAttempt(ik, settings, data, practice) {
        let attemptData = _.pick(data,
            '_id', 'user', 'studentName', 'isEvaluated', 'isAbandoned', 'email', 'QA', 'plusMark', 'minusMark',
            'totalTime', 'totalCorrects', 'totalErrors', 'pending', 'terminated',
            'practicesetId', 'totalMissed', 'idOffline', 'attemptType', 'referenceId', 'referenceType',
            'totalQuestions', 'totalMarkeds', 'isCratedOffline', 'isAnsync', 'fraudDetected', 'isFraudulent');

        attemptData.subjects = practice.subjects;
        if (typeof practice.isShowAttempt != 'undefined') {
            attemptData.isShowAttempt = practice.isShowAttempt;
        }
        if (!attemptData.totalQuestions) {
            attemptData.totalQuestions = attemptData.totalMissed + attemptData.totalCorrects + attemptData.totalErrors;
        }
        this.classroomRepository.setInstanceKey(ik)
        let classes = await this.classroomRepository.find({ 'students.studendId': new ObjectId(data.user as string) }, { _id: 1 })

        let attClasses = []
        classes.forEach(uc => {
            if (practice.classRooms.findIndex(c => c.equals(uc._id)) > -1) {
                attClasses.push(uc._id)
            }
        })
        if (!attClasses.length) {
            attClasses = practice.classRooms
        }

        attemptData.practiceSetInfo = {
            title: practice.title,
            subjects: practice.subjects,
            classRooms: attClasses,
            units: practice.units,
            titleLower: practice.titleLower,
            accessMode: practice.accessMode
        }

        if (practice.level != undefined) {
            attemptData.practiceSetInfo.level = practice.level
        }

        attemptData.practiceSetInfo.createdBy = practice.user._id;
        attemptData.createdBy = {
            user: practice.user._id,
            name: practice.user.name.toLowerCase()
        };

        attemptData.isAbandoned = data.isAbandoned || !('showFeedback' in practice) || practice.showFeedback;

        let maxMarks = 0;

        for (let i = 0; i < data.QA.length; i++) {
            maxMarks += data.QA[i].actualMarks;
        }

        attemptData.maximumMarks = maxMarks;

        let attempt = await this.createAttemptAndAttemptDetails(ik, attemptData)


        if (settings.features.studentLevel) {
            this.updateUserLevel(ik, attempt)
        }

        if (!practice.autoEvaluation) {
            await this.markEvaluationPending(ik, attempt)
        } else {
            if (attempt.isEvaluated) {
                await this.createArchiveAttemptAndAttemptDetails(ik, attempt, practice)
            }
        }

        if (!attempt.isAbandoned) {
            let count = await this.attemptRepository.countDocuments({
                practicesetId: practice._id,
                isAbandoned: false
            })
            let results = await this.practicesetRepository.updateOne({ _id: practice._id },
                {
                    totalAttempt: count
                }
            )
        }

        if (practice.camera && practice.testMode == 'proctored') {
            let settings: any = await this.redisCache.getSettingAsync(ik)
            if (settings.features.fraudDetect) {
                let idx = config.dbs.findIndex(db => db.instancekey == ik)

                let database = config.dbs[idx].url.substring(config.dbs[idx].url.indexOf('/') + 1)

                Logger.debug('lambda invoked ' + attempt._id.toString())

                const data = this.s3Service.recognito(config.aws.lambda.mode, database, attempt.user.toString(), attempt._id.toString());
                Logger.log('%j', data)
            }
        }

        if (attempt.referenceId && attempt.referenceType == 'course') {
            await this.updateUserCourse(ik, attempt.user, {
                course: attempt.referenceId, Content: attempt.referenceData
            }, attempt)
        }
        return attempt

    }

    sortQuestion(questions) {
        if (questions[0] && questions[0].order) {
            questions.sort((q1, q2) => {
                if (q1.order < q2.order) {
                    return -1;
                } else if (q1.order > q2.order) {
                    return 1;
                } else {
                    return 0;
                }
            });
        } else {
            questions.sort((q1, q2) => {
                if (q1.createdAt < q2.createdAt) {
                    return -1;
                } else if (q1.createdAt > q2.createdAt) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    }
    async getQuestionByPractice(ik, practice) {
        this.questionRepository.setInstanceKey(ik)

        let data: any = await this.questionRepository.populate(
            practice,
            {
                path: 'questions.question',
                options: { lean: true }
            }
        )

        this.sortQuestion(data.questions)
        let questions = []

        data.questions.forEach(qp => {
            qp.question.createdAt = qp.createdAt;
            qp.question.order = qp.order;
            qp.question.section = qp.section;


            questions.push(qp.question)
        })
        return questions
    }
    async process(ik, attemptId, rawAttemptData) {
        try {
            this.attemptRepository.setInstanceKey(ik)
            attemptId = new Types.ObjectId(attemptId)
            let savedData = await this.attemptRepository.findOne({ _id: attemptId })
            savedData = await this.attemptRepository.populate(savedData,
                {
                    path: "user",
                    options: { lean: true }
                }
            )

            let user = savedData.user;

            let answersOfUser = rawAttemptData.answersOfUser;
            let practiceId = new Types.ObjectId(rawAttemptData.practiceId);

            let isAbandoned = rawAttemptData.isAbandoned;

            let questionOrder = rawAttemptData.questionOrder

            let settings: any = await this.redisCache.getSettingAsync(ik)


            let practice: any = await this.practicesetRepository.findById(practiceId);

            practice = await this.practicesetRepository.populate(practice,
                {
                    path: 'user',
                    select: "-salt -hashedPassword"
                }
            )

            rawAttemptData.questionOrder = rawAttemptData.questionOrder.map(id => new Types.ObjectId(id));
            if (rawAttemptData.questionOrder) {
                practice.questions = practice.questions.filter(q => {
                    return !!rawAttemptData.questionOrder.find(e => {
                        return e.toString() == q.question.toString()
                    });
                })
            }

            let questions = await this.getQuestionByPractice(ik, practice);
            let totalMarkeds = 0;
            let questionplusMark = 1; //  mark for question each
            let questionMinusMark = 0; // mark for each question
            let totalErrors = 0;
            let totalMissed = 0;
            let pending = 0;
            let totalTime = 0;
            let totalQuestions = questions.length;
            let isEvaluated = true;
            let userAnswerLookup = {};
            let minusMark = 0;
            let plusMark = 0;
            let totalOffscreen = 0;
            for (let idx = 0; idx < answersOfUser.length; idx++) {
                if (answersOfUser[idx] != null && answersOfUser[idx].question != null) {
                    userAnswerLookup[answersOfUser[idx].question] = answersOfUser[idx];
                }
            }

            let answerList = [];
            for (let i = 0; i < questions.length; i++) {
                let timeEslapse = 0;
                let question = questions[i];
                let qId = question._id.toString();
                let userAnswers = [];
                let userCorrectAnswers = [];
                let userIncorrectAnswers = [];
                if (userAnswerLookup[qId]) {
                    userAnswerLookup[qId].subject = questions[i].subject
                    userAnswerLookup[qId].unit = question[i].unit
                    userAnswerLookup[qId].topic = question[i].topic
                }



                if (userAnswerLookup[qId] && userAnswerLookup[qId].answers && userAnswerLookup[qId].answers.length > 0) {
                    let answers = question.answers;
                    let hasWrongAnswer = false;

                    let answerCorrect = [];
                    let answerIncorrect = [];

                    if (typeof userAnswerLookup[qId].answers[0] === 'object') {
                        if (question.category == 'fib') {
                            userAnswers = [];
                            let answerOptionCount = answers.length;
                            let userAnswerCount = 0;

                            userAnswerLookup[qId].answers.forEach(
                                function (userAnswer) {
                                    answers.forEach(function (actualAnswer) {
                                        if (String(userAnswer.answerId) == String(actualAnswer._id)) {
                                            if (fibAnswerCompare(actualAnswer, userAnswer)) {
                                                userAnswerCount++;
                                            }
                                        }
                                    })
                                }
                            )


                            if (userAnswerCount != answerOptionCount) {
                                totalErrors = totalErrors + 1;
                                hasWrongAnswer = true;
                            }
                        } else if (question.category == "code") {
                            userAnswers = [];
                            hasWrongAnswer = true;

                            let codeData = _.find(question.coding, {
                                language: userAnswerLookup[qId].answers[0].codeLanguage
                            });
                            if (codeData) {
                                hasWrongAnswer = false;
                                question.testcases.forEach(function (testcase) {
                                    let userCase = _.find(userAnswerLookup[qId].answer[0].testcases, utc => {
                                        let isTheCase = true
                                        if (question.hasArg) {
                                            isTheCase = utc.args == testcase.args
                                        }

                                        if (isTheCase && question.hasUserInput) {
                                            isTheCase = utc.input == testcase.input
                                        }

                                        return isTheCase
                                    });
                                    if (userCase) {
                                        if (!userCase.output || !codingAnswerCompare(testcase.output, userCase.output)) {
                                            userCase.status = false;
                                            hasWrongAnswer = true;
                                        } else {
                                            userCase.status = true;
                                        }
                                    } else {
                                        if (userAnswerLookup[qId].answers[0].testcases) {
                                            Logger.warn('userCase not found for question %s - language %s - testcase %j - user answer %j',
                                                question._id.toString(),
                                                userAnswerLookup[qId].answers[0].codeLanguage, testcase, userAnswerLookup[qId].answers[0]
                                            )
                                        }

                                        hasWrongAnswer = true;
                                    }
                                })

                                if (settings.features.partialCodingMark) {
                                    let correctCases = userAnswerLookup[qId].answers[0].testcases ?
                                        userAnswerLookup[qId].answers[0].testcases.filter(utc => utc.status).length : 0
                                    question.codingAccuracy = correctCases / question.testcases.length
                                    hasWrongAnswer = question.codingAccuracy == 0
                                }
                            } else {
                                Logger.warn('codeData not found for question %s - language %s',
                                    question._id.toString(),
                                    userAnswerLookup[qId].answers[0].codeLanguage
                                )
                            }

                            if (hasWrongAnswer) {
                                totalErrors = totalErrors + 1;
                            }
                        } else if (question.category == 'descriptive') {
                            pending = pending + 1;
                            isEvaluated = false;
                            hasWrongAnswer = true;
                        } else if (question.category == 'mixmatch') {
                            const match = []
                            answers.forEach(function (actualAnswer, i) {
                                const index = userAnswerLookup[qId].answers.findIndex(a => a.answerText == actualAnswer.answerText)
                                const correctMatch = mixmatchAnswerCompare(actualAnswer, userAnswerLookup[qId].answers[index])
                                match.push(correctMatch)
                            })
                            if (match.includes(false)) {
                                totalErrors = totalErrors + 1;
                                hasWrongAnswer = true;
                            }
                        } else {
                            userAnswers = [];


                            userAnswerLookup[qId].answers.forEach(function (userAnswer, index) {
                                userAnswers.push(userAnswer.answerId)
                            })

                            for (let c = 0; c < answers.length; c++) {
                                if (answers[c].isCorreceAnswer) {
                                    answerCorrect.push(answers[c]._id.toString());
                                } else {
                                    answerIncorrect.push(answers[c]._id.toString())
                                }
                            }
                            hasWrongAnswer = false;

                            if (question.questionType == 'multiple' && question.partialMark) {
                                userCorrectAnswers = _.intersection(answerCorrect, userAnswers)
                                userIncorrectAnswers = _.intersection(answerIncorrect, userAnswers)

                                if (userIncorrectAnswers.length > 0) {
                                    totalErrors = totalErrors + 1;
                                    hasWrongAnswer = true;
                                }
                            } else {
                                if (question.category == 'mcq' && question.questionType == 'multiple') {
                                    userIncorrectAnswers = _.intersection(answerIncorrect, userAnswers)
                                    if (userIncorrectAnswers.length > 0 || answerCorrect.length != userAnswers.length) {
                                        totalErrors = totalErrors + 1;
                                        hasWrongAnswer = true;
                                    }
                                } else {
                                    let diff = _.difference(answerCorrect, userAnswers);

                                    if (diff.length > 0) {
                                        totalErrors = totalErrors + 1;
                                        hasWrongAnswer = true;
                                    }
                                }
                            }
                        }
                    } else {
                        userAnswers = [];
                        userAnswers = userAnswerLookup[qId].answers;
                        for (let c in answers) {
                            if (answers[c].isCorreceAnswer) {
                                answerCorrect.push(answers[c]._id.toString());
                            }
                        }
                        hasWrongAnswer = false;
                        if (question.category == 'mcq' && question.questionType == 'multiple') {
                            userIncorrectAnswers = _.intersection(answerIncorrect, userAnswers)
                            if (userIncorrectAnswers.length > 0 || answerCorrect.length != userAnswers.length) {
                                totalErrors = totalErrors + 1;
                                hasWrongAnswer = true;
                            }
                        } else {
                            let diff = _.difference(answerCorrect, userAnswers);

                            if (diff.length > 0) {
                                totalErrors = totalErrors + 1;
                                hasWrongAnswer = true;
                            }
                        }
                    }
                    if (userAnswerLookup[qId].timeEslapse) {
                        totalTime += userAnswerLookup[qId].timeEslapse;
                    }
                    timeEslapse = userAnswerLookup[qId].timeEslapse;

                    if (question.category == 'descriptive') {
                        userAnswerLookup[qId].status = Constants.PENDING;
                        userAnswerLookup[qId].obtainMarks = 0;
                        userAnswerLookup[qId].hasMarked = question.hasMarked;
                    } else if (hasWrongAnswer) {
                        if (practice.enableMarks) {
                            if (practice.isMarksLevel) {
                                questionMinusMark = practice.minusMark;
                            } else {
                                questionMinusMark = question.minusMark;
                            }
                            minusMark += questionMinusMark;
                        }
                        userAnswerLookup[qId].status = Constants.INCORRECT;
                        userAnswerLookup[qId].obtainMarks = questionMinusMark;
                        userAnswerLookup[qId].hasMarked = question.hasMarked;
                    } else {
                        if (practice.enableMarks) {
                            if (question.category == 'code' && settings.features.partialCodingMark && question.codingAccuracy) {
                                questionplusMark = codingPartialMark(practice, question, userAnswerLookup[qId].answers[0].testcases, question.coding.timeLimit, question.coding.memLimit)
                                questionplusMark = round(questionplusMark, 2);
                            } else {
                                if (practice.isMarksLevel) {
                                    questionplusMark = practice.plusMark;
                                } else {
                                    if (question.category == 'mcq' && question.questionType == 'multiple' && question.partialMark) {
                                        questionplusMark = 0
                                        if (answerCorrect.length == userCorrectAnswers.length) {
                                            questionplusMark = question.plusMark
                                        } else {
                                            for (let uc = 0; uc < userCorrectAnswers.length; uc++) {
                                                for (let c = 0; c < question.answers.length; c++) {
                                                    if (question.answers[c]._id.toString() == userCorrectAnswers[uc]) {
                                                        questionplusMark += question.answers[c].marks
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        questionplusMark = question.plusMark;
                                    }
                                }
                            }
                            plusMark += questionplusMark;
                        } else {
                            plusMark++;
                        }
                        userAnswerLookup[qId].status = Constants.CORRECT;
                        userAnswerLookup[qId].obtainMarks = questionplusMark;
                        userAnswerLookup[qId].hasMarked = question.hasMarked;
                    }
                } else {
                    if (userAnswerLookup[qId] == null) {
                        userAnswerLookup[qId] = {
                            question: question._id,
                            answers: [],
                            timeEslapse: 0,
                            subject: question.subject,
                            unit: question.unit,
                            topic: question.topic
                        };
                    } else {
                        timeEslapse = userAnswerLookup[qId].timeEslapse;
                        totalTime += timeEslapse;
                    }
                    userAnswerLookup[qId].isMissed = true;
                    userAnswerLookup[qId].status = Constants.MISSED;
                    userAnswerLookup[qId].obtainMarks = 0;
                    userAnswerLookup[qId].hasMarked = question.hasMarked;

                    totalMissed++;
                }
                if (practice.enableMarks) {
                    if (practice.isMarksLevel) {
                        userAnswerLookup[qId].actualMarks = practice.plusMark;
                    } else {
                        // Now we support partial mark, each correct answer has its own mark
                        if (question.category == 'mcq' && question.questionType == 'multiple' && question.partialMark) {
                            if (question.plusMark) {
                                userAnswerLookup[qId].actualMarks = question.plusMark;
                            } else {
                                userAnswerLookup[qId].actualMarks = 0
                                for (let c = 0; c < question.answers.length; c++) {
                                    if (question.answers[c].isCorrectAnswer) {
                                        userAnswerLookup[qId].actualMarks += question.answers[c].marks
                                    }
                                }
                            }
                        } else {
                            userAnswerLookup[qId].actualMarks = question.plusMark;
                        }
                    }
                } else {
                    userAnswerLookup[qId].actualMarks = 1;
                }
                userAnswerLookup[qId].category = question.category;
                answerList.push(userAnswerLookup[qId]);

                if (question.hasMarked) {
                    totalMarkeds++;
                }

                if (userAnswerLookup[qId].offscreen && userAnswerLookup[qId].offscreen.length > 0) {
                    let offTime = 0
                    userAnswerLookup[qId].offscreen.forEach(t => offTime += t);
                    totalOffscreen += offTime
                }
            }
            if (questionOrder) {
                let newOrder = []
                try {
                    questionOrder.forEach(function (qOrder) {
                        // Find question data in order
                        let idx = _.findIndex(answerList, (q) => {
                            return q.question.toString() == qOrder.q;
                        });
                        if (idx > -1) {
                            let reorderQuestion = answerList[idx]
                            newOrder.push(reorderQuestion);
                            reorderQuestion.answerOrder = qOrder.answers
                        } else {
                            Logger.warn('missing question order')
                            Logger.debug('%j', qOrder)
                            Logger.debug('%j', answerList)
                        }
                    })
                } catch (exception) {
                    Logger.warn('fail to reorder attempt question')
                    throw (exception)
                }

                if (newOrder.length == answerList.length) {
                    answerList = newOrder
                }
            }


            let attempt: any = {
                _id: savedData._id,
                user: user._id,
                QA: answerList,
                totalTime: totalTime,
                totalErrors: totalErrors,
                plusMark: plusMark,
                minusMark: minusMark,
                pending: pending,
                totalCorrects: totalQuestions - totalErrors - totalMissed - pending,
                practicesetId: practiceId,
                totalMissed: totalMissed,
                totalQuestions: totalQuestions,
                totalMarkeds: totalMarkeds,
                isEvaluated: isEvaluated
            };
            if (isAbandoned) {
                attempt.isAbandoned = isAbandoned;
            }

            if (rawAttemptData.terminated) {
                attempt.terminated = true;
            }

            if (rawAttemptData.fraudDetected) {
                attempt.fraudDetected = rawAttemptData.fraudDetected
            }


            let isFraudulent = (attempt.totalCorrects / attempt.totalQuestions) > 0.3 && (attempt.totalTime - totalOffscreen) <= (practice.totalTime * 60000 * 0.3)

            attempt.isFraudulent = isFraudulent


            let newAttempt = await this.handleNewAttempt(ik, settings, attempt, practice)

            if (practice.isPartnerExam) {
                let provider = settings.ssoConfig.find(d => d.clientId == user.provider)
                if (provider && provider.apis) {
                    let tokenApi = provider.apis.find(d => d.key == 'generate_token')
                    let getUserIdApi = provider.apis.find(d => d.key == 'get_userId')

                    let updateProgressApi = provider.apis.find(d => d.key == 'update_progress')

                    if (tokenApi && tokenApi.url && getUserIdApi && getUserIdApi.url && updateProgressApi && updateProgressApi.url && provider.activities.find(d => d.testCode == practice.testCode)) {
                        newAttempt.subjects = newAttempt.subjects.map(s => {
                            return {
                                "name": s.name,
                                "unAttemptedQuestion": s.missed,
                                "maximumMark": s.maxMarks,
                                "obtainMark": s.mark,
                                "correctAttempt": s.correct,
                                "incorrectAttempt": s.incorrect,
                            }
                        })

                        newAttempt.testCode = practice.testCode

                        this.proadapt(settings, user, newAttempt)
                    }
                }
            }
            if (!practice.isShowAttempt || !practice.autoEvaluation) {
                return { _id: newAttempt._id }
            } else {
                return newAttempt;
            }

        } catch (err) {
            console.log(err);
            throw "Internal server error"
        }
    }
}