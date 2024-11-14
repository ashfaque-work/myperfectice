import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import {
  CourseRepository, UsersRepository, SubjectRepository, SettingRepository, LocationRepository, FeedbackRepository,
  FavoriteRepository, PracticeSetRepository, UserCourseRepository, ClassroomRepository, UserEnrollmentRepository,
  AttemptRepository, escapeRegex, UserCourse, canOnlySeeHisOwnContents, canOnlySeeLocationContents, AttemptDetailRepository,
  RedisCaching, NotificationRepository, Notification, isEmail, Settings
} from '@app/common';
import {
  AddToFavoriteRequest, AddToFavoriteResponse, CourseRequest, GetCourseByIdRequest, GetAvgRatingByCourseRequest,
  GetCourseByIdResponse, GetCourseByClassroomResponse, AddFeedbackRequest, RemoveContentFavoriteResponse,
  UpdateCourseRequest, RemoveFavoriteRequest, RemoveFavoriteResponse, DeleteCourseRequest, GetCourseByClassroomRequest,
  AddClassToCourseRequest, AddClassToCourseResponse, RemoveClassFromCourseRequest, RemoveClassFromCourseResponse,
  AddFeedbackResponse, GetRatingCountByCourseRequest, AddSectionRequest, AddSectionResponse, UpdateSectionsOrderRequest,
  UpdateSectionsOrderResponse, UpdateCourseContentRequest, DeleteContentRequest, DeleteContentResponse, DeleteSectionRequest,
  DeleteSectionResponse, AddContentFavoriteRequest, AddContentFavoriteResponse, RemoveContentFavoriteRequest,
  GetFavoriteCourseRequest, GetOngoingClassesRequest, GetCourseProgressRequest, GetCourseProgressResponse, GetUserCourseRequest,
  FetchTeacherAssessmentRequest, GetClassesTimeSpentRequest, GetCourseSectionsReportRequest, GetStudentCourseOverviewRequest,
  GetCourseSectionByStatusRequest, VerifyCourseUserProgressRequest, PublicEnrolledCourseRequest, GetCourseContentAnalyticsRequest,
  GetCourseSubjectRequest, GetStudentCoursesRequest, GetTeacherHighestPaidCoursesRequest, GetTopCategoriesCourseRequest,
  GetPublisherCourseRequest, UserWithoutEnrollRequest, GetCourseMembersRequest, GetTeacherCourseRequest, GetOngoingCourseRequest,
  EditContentInSectionRequest, GetAllMyCourseProgressRequest, GetCoursePublicReq, GetTeacherCourseDetailRequest,
  UpdateContentTimeSpentRequest, CompleteContentRequest, StartContentRequest, GetCoursesRequest, GetTeacherArchivedCoursesRequest,
  GetTeacherMostPopularCoursesRequest, GetAllTeacherCoursesRequest, GetPublicListingRequest, GetBestSellerCourseRequest,
  GetPopularCourseRequest, GetArchiveCoursesRequest, GetQuestionDistributionAnalyticsRequest, GetRankingAnalyticsRequest,
  GetPracticeTimeAnalyticsRequest, GetLearningTimeAnalyticsRequest, GetCompletionAnalyticsRequest, GetAccuracyAnalyticsRequest,
  GetMyFavoriteRequest, GetFavoriteSubjectsRequest, CountRequest, NotifyStudentsAfterWithdrawalRequest, FindRequest,
  GetOngoingCourseContentReq, GetAuthorsReq, GetRatingByCourseReq, GetCoursesPublicReq, PublishSectionReq,

} from '@app/common/dto/course.dto';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from 'nestjs-grpc-exceptions';
import { Types } from 'mongoose';
import { CertificateRepository } from '@app/common/database/repositories/certificate.repository';
import { response } from 'express';
import { regex, regexName, round } from '@app/common/Utils'
import timeHelper from '@app/common/helpers/time-helper';
import { AttendanceRepository } from '@app/common/database/repositories/attendance.repository';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UsersRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly settingRepository: SettingRepository,
    private readonly locationRepository: LocationRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly favoriteRepository: FavoriteRepository,
    private readonly practiceSetRepository: PracticeSetRepository,
    private readonly userCourseRepository: UserCourseRepository,
    private readonly classroomRepository: ClassroomRepository,
    private readonly userEnrollmentRepository: UserEnrollmentRepository,
    private readonly certificateRepository: CertificateRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptDetailRepository: AttemptDetailRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly redisCaching: RedisCaching,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly settings: Settings,
  ) { }
  removeAD(doc) {
    if (doc.attemptdetails)
      if (doc.attemptdetails.QA) {
        var QA = doc.attemptdetails.QA.slice();
        if (!(Object.keys(doc).indexOf("_id") + 1)) {
          doc = doc.toObject();
        }
        doc.QA = QA;
        doc.attemptdetails = doc.attemptdetails._id;
      }
    return doc;
  }
  removeAttemptDetails(docs) {
    if (Array.isArray(docs)) {
      for (var i = 0; i < docs.length; i++) {
        docs[i] = this.removeAD(docs[i]);
      }
    } else {
      docs = this.removeAD(docs);
    }

    return docs;
  }
  async withdrawalEmail(req, courseTitle, enrolledUsers, notificationMsg) {
    await this.redisCaching.getSetting(req, async (settings) => {
      for (let i = 0; i < enrolledUsers.length; i++) {

        let notification: any = new Notification();
        notification.receiver = enrolledUsers[i].user._id;
        notification.type = "notification";
        notification.itemId = enrolledUsers[i].item;
        notification.modelId = "withdrawCourse";
        notification.message = notificationMsg;
        notification.subject = "Withdrawal of enrolled course"
        await this.notificationRepository.create(notification)
        let options = {
          user: enrolledUsers[i].user,
          message: notificationMsg,
          studentName: enrolledUsers[i].user._id,
          subject: "Withdrawal of enrolled course",
          courseTitle: courseTitle,
        }
        let dataMsgCenter = {
          receiver: enrolledUsers[i].user._id,
          modelId: "withdrawCourse",
          sender: new Types.ObjectId(req.userId),
          to: enrolledUsers[i].user.userId,
          isEmail: true,
          isScheduled: true,
          isSent: false,
        };
        if (isEmail(options.user.userId)) {
          dataMsgCenter.to = options.user.userId;
          dataMsgCenter.isScheduled = true;
        }
        // MessageCenter.sendWithTemplate(
        //   req,
        //   "withdraw-course",
        //   options,
        //   dataMsgCenter
        // );
      }
    })
  }
  async getEnrolledCourseIds(req, courseId) {
    this.userEnrollmentRepository.setInstanceKey(req.instancekey)
    var enrolledCourseIds = await this.userEnrollmentRepository.find(
      { type: "course", item: new Types.ObjectId(courseId) },
      { _id: 1, item: 1, user: 1 }
    )
    await this.userEnrollmentRepository.populate(enrolledCourseIds, { path: "user", select: "name userId _id" })

    return enrolledCourseIds;
  }
  async findOneAttempt(req, filter, sort) {

    var attemptQuery = await this.attemptRepository.findOne(filter, null, sort)
    this.attemptRepository.setInstanceKey(req.instancekey)
    await this.attemptRepository.populate(attemptQuery, [
      {
        path: "attemptdetails",
        select: "QA",
      }, {
        path: "user",
        select: "name role avatar",
        options: { lean: true },
      }
    ]
    )
    let attempt = this.removeAttemptDetails(attemptQuery)
    this.practiceSetRepository.setInstanceKey(req.instancekey)
    let practiceSetObj = await this.practiceSetRepository.findById(attemptQuery.practiceSetId)

    if (practiceSetObj != null) {
      attempt.practiceSetInfo.enableMarks = practiceSetObj.enableMarks;
      attempt.practiceSetInfo.isShowResult = practiceSetObj.isShowResult;
      attempt.practiceSetInfo.isShowAttempt = practiceSetObj.isShowAttempt;
      attempt.practiceSetInfo.testMode = practiceSetObj.testMode;

      attempt.practiceSetInfo.totalQuestion = practiceSetObj.totalQuestion;
      attempt.practiceSetInfo.totalTime = practiceSetObj.totalTime;
      attempt.practiceSetInfo.attemptAllowed =
        practiceSetObj.attemptAllowed;
      attempt.practiceSetInfo.sectionTimeLimit =
        practiceSetObj.sectionTimeLimit;

      attempt.practiceSetInfo.user = practiceSetObj.userInfo;
      attempt.practiceSetInfo._id = practiceSetObj._id;
      attempt.practiceSetInfo.questions = practiceSetObj.questions;
      attempt.practiceSetInfo.sections = practiceSetObj.sections;
      attempt.practiceSetInfo.status = practiceSetObj.status;
      attempt.practiceSetInfo.expiresOn = practiceSetObj.expiresOn;
      attempt.practiceSetInfo.fullLength = practiceSetObj.fullLength;
      if (req.userRole == "student") {
        if (!practiceSetObj.isShowAttempt ||
          !attempt.isEvaluated ||
          !practiceSetObj.isShowResult) {
          attempt.practiceSetInfo.questions = [];
          attempt.QA = [];
          return "res.json(attempt)";
        }
      }
      this.attendanceRepository.setInstanceKey(req.instancekey)
      let att = await this.attendanceRepository.findOne({
        practicesetId: new Types.ObjectId(attempt.practiceSetId),
        studentId: attempt.user
      })
      if (att) {
        attempt.practiceSetInfo.attendance = {
          attemptLimit: att.attemptLimit,
          offscreenLimit: att.offscreenLimit,
        }
      }
      return attempt
    }
    return attempt
  }
  async baseFilter(req, includePublisher?: any) {
    return new Promise(async (resolve, reject) => {
      try {
        if (req.id) {
          this.userCourseRepository.setInstanceKey(req.instancekey)
          let isEnrolled = await this.userCourseRepository.findOne(
            { user: new ObjectId(req.userId as string), course: new ObjectId(req.courseId as string) }
          );
          if (isEnrolled) {
            return resolve({});
          }
        }
        let expire = {
          $or: [
            {
              expiresOn: {
                $gt: new Date()
              }
            },
            {
              expiresOn: null,
            },
            {
              expiresOn: "",
            }
          ]
        }
        let accessMode: any = {
          $or: [
            {
              accessMode: "public",
            },
            {
              accessMode: "buy",
            }
          ]
        };
        var basicFilter = {
          $and: [accessMode, expire],
        };
        if (!req.userId) {
          return resolve(basicFilter)
        }
        var invitationFilter = {};
        var classIds = [];
        this.classroomRepository.setInstanceKey(req.instancekey)
        classIds = await this.classroomRepository.distinct("_id", {
          "students.studentUserId": new ObjectId(req.userId as string),
          active: true
        })
        if (classIds.length) {
          invitationFilter = {
            $and: [
              {
                accessMode: "invitation",
              },
              {
                classrooms: {
                  $in: classIds
                }
              }
            ]
          }
          accessMode.$or.push(invitationFilter);
        };
        var locationCond = {};
        if (includePublisher) {
          locationCond = {
            $or: [
              {
                locations: new Types.ObjectId(req.activeLocation)
              },
              {
                origin: "publisher",
              }
            ],
          };
        } else {
          locationCond = { locations: new Types.ObjectId(req.activeLocation) }
        }
        return resolve({
          $and: [locationCond, accessMode, expire]
        })
      } catch (err) {
        return reject(err.message)
      }
    })
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
  regexName(name) {
    return {
      $regex: new RegExp(
        [this.escapeRegExp(name).replace(/\s+/g, " ").trim()].join(""),
        "i"
      ),
    };
  };
  escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };
  async createCourse(request: CourseRequest) {
    try {
      // Fetch user details using the provided user ID & Check if user exists and has an email
      this.userRepository.setInstanceKey(request.instancekey)
      const user = await this.userRepository.findOne({ _id: request.userid });
      if (!user || !user.email) {
        return { message: 'Please add your email in your account before creating a course.' };
      }
      // Map subjects to extract IDs
      const subjectIds = request.subjects.map(subject => {
        if (!ObjectId.isValid(subject._id)) {
          throw 'Invald Subject Id.';
        }
        return new ObjectId(subject._id);
      });

      // Find subjects by IDs & Check if all subjects are found
      this.subjectRepository.setInstanceKey(request.instancekey)
      const subjects = await this.subjectRepository.find({ _id: { $in: subjectIds } });
      if (subjects.length !== subjectIds.length) {
        return { message: 'The selected subject or examination is no longer active' };
      }

      // Fetch settings from the repository
      this.settingRepository.setInstanceKey(request.instancekey)
      const setting = await this.settingRepository.findOne({ slug: 'whiteLabel' });

      // Prepare user filter for existing courses
      let userFilter: any = {
        title: request.title,
        locations: user.activeLocation
      };

      const existing = await this.courseRepository.findOne(userFilter)
      if (existing) {
        throw new UnprocessableEntityException({ params: 'title', message: ' A course with this name already exists in your list.' })
      }

      // Check if white-labeling is enabled
      if (!setting || !setting.isWhiteLabelled) {
        userFilter.user = user._id;
      }

      // Create a new course request object with updated properties
      const course: CourseRequest = {
        ...request,
        user: { _id: user._id, name: user.name },
        countries: [{
          code: user.country.code,
          name: user.country.name,
          currency: user.country.currency,
          price: 0,
          marketPlacePrice: 0,
          discountValue: 0
        }],
        lastModifiedBy: user._id,
        locations: [],
        origin: 'institute'
      };

      // Check user role and active location type
      if (user.roles && user.roles.includes('publisher')) {
        course.origin = 'publisher';
      } else if (user.activeLocation) {
        this.locationRepository.setInstanceKey(request.instancekey)
        const loc = await this.locationRepository.findOne({ _id: user.activeLocation });
        if (loc && loc.type === 'publisher') {
          course.origin = 'publisher';
        }
      }

      // Add active location to course
      if (user.activeLocation) {
        course.locations.push(user.activeLocation);
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      return await this.courseRepository.create(course);
    } catch (error) {
      if (error instanceof (UnprocessableEntityException)) {
        throw new GrpcInternalException(error.getResponse());
      }
      throw new GrpcInternalException(error.message);
    }
  }

  async getCourseById(request: GetCourseByIdRequest): Promise<GetCourseByIdResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      const course = await this.courseRepository.findOne(new Types.ObjectId(request._id));

      if (course) {
        return { response: course };
      } else {
        throw new Error('Course not found');
      }
    } catch (error) {
      throw new Error('Failed to get course by Id');
    }
  }

  async updateCourse(request: UpdateCourseRequest) {
    try {
      const mongooseId = new ObjectId(request._id);
      delete request._id;
      this.courseRepository.setInstanceKey(request.instancekey)
      const updatedCourse = await this.courseRepository.findByIdAndSave(mongooseId, request);
      if (updatedCourse) {
        return { response: updatedCourse };
      } else {
        throw new Error('Course not found');
      }
    } catch (error) {
      throw new Error('Failed to update course');
    }
  }

  async deleteCourse(request: DeleteCourseRequest) {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      const deletedCourse = await this.courseRepository.findOneAndDelete(new Types.ObjectId(request._id));
      if (deletedCourse) {
        return deletedCourse;
      } else {
        throw new Error('Course not found');
      }
    } catch (error) {
      throw new Error('Failed to delete course');
    }
  }

  async getCourseByClassroom(request: GetCourseByClassroomRequest): Promise<GetCourseByClassroomResponse> {
    try {
      if (!request._id || !ObjectId.isValid(request._id)) {
        throw ('Invalid Classroom ID');
      }
      const condition = {
        classrooms: { $in: [new ObjectId(request._id)] },
        $or: [
          { expiresOn: { $gt: new Date() } },
          { expiresOn: null },
          { expiresOn: '' }
        ],
        status: 'published'
      };

      // Define the projection to specify which fields to include in the result
      const projection = {
        title: 1,
        colorCode: 1,
        imageUrl: 1,
        totalRatings: 1,
        rating: 1,
        level: 1,
        duration: 1,
        price: 1,
        accessMode: 1,
        subjects: 1,
        instructors: 1,
        user: 1,
        statusChangedAt: 1,
        type: 1,
        status: 1,
        startDate: 1,
        expiresOn: 1
      };

      // Query the course using the constructed condition and projection
      this.courseRepository.setInstanceKey(request.instancekey)
      const course = await this.courseRepository.findOne(condition, projection);
      if (course) {
        return { response: course };
      } else {
        throw new NotFoundException()
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException('Not Found')
      }
      throw new GrpcInternalException(error);
    }
  }

  async addClassToCourse(request: AddClassToCourseRequest): Promise<AddClassToCourseResponse> {
    try {
      const { _id: courseId, itemIds } = request;

      // Validate course ID and item IDs
      if (!ObjectId.isValid(courseId) || itemIds.some(id => !ObjectId.isValid(id))) {
        throw ('Invalid course ID or item IDs');
      }

      // Convert the itemIds from strings to ObjectId instances
      const objectIdItemIds = itemIds.map(id => new ObjectId(id));

      // Update the course document in the database with the new classes
      this.courseRepository.setInstanceKey(request.instancekey)
      const updatedCourse = await this.courseRepository.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { classrooms: { $each: objectIdItemIds } } }, // Add new classes to the existing ones
        { new: true } // Return the updated document
      );

      if (!updatedCourse) {
        throw new Error('Course not found');
      }
      // Convert the ObjectId instances to string IDs
      const stringClassrooms = updatedCourse.classrooms.map(id => id.toString());

      return { classrooms: stringClassrooms };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  async removeClassFromCourse(request: RemoveClassFromCourseRequest): Promise<RemoveClassFromCourseResponse> {
    try {
      const { _id, itemId } = request;
      const objectIdItemId = new ObjectId(itemId);

      // Call findOneAndUpdate method with $pull operation to remove itemId from classrooms array
      this.courseRepository.setInstanceKey(request.instancekey)
      const updatedCourse = await this.courseRepository.findOneAndUpdate(
        {
          _id: _id,
          classrooms: objectIdItemId // Ensure itemId exists in classrooms array
        },
        { $pull: { classrooms: objectIdItemId } },
        { new: true } // Return the updated document
      );

      // Check if the updatedCourse is null or undefined
      if (!updatedCourse) {
        throw ('Course not found or item not removed');
      }

      return { removedItemId: itemId };
    } catch (error) {
      throw new GrpcInternalException(error);
    }
  }

  //Get Average Rating By Course
  async getAvgRatingByCourse(request: GetAvgRatingByCourseRequest) {
    try {
      this.feedbackRepository.setInstanceKey(request.instancekey)
      let result = await this.feedbackRepository.aggregate([
        {
          $match: {
            courseId: new Types.ObjectId(request._id),
          },
        },
        {
          $group: {
            _id: { course: "$courseId", rating: "$rating" },
            totalRatings: { $sum: "$rating" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.course",
            ratings: {
              $push: {
                rating: "$_id.rating",
                count: "$count",
                avgRating: {
                  $cond: [
                    {
                      $eq: ["$count", 0],
                    },
                    0,
                    {
                      $divide: ["$_id.rating", "$count"],
                    },
                  ],
                },
              },
            },
            totalRatings: { $sum: "$totalRatings" },
            count: { $sum: "$count" },
          },
        },
        {
          $project: {
            ratings: 1,
            totalRatings: 1,
            count: 1,
            avgRating: {
              $cond: [
                {
                  $eq: ["$count", 0],
                },
                0,
                {
                  $divide: ["$totalRatings", "$count"],
                },
              ],
            },
          },
        },
      ])
      console.log(result);
      
      if (result.length == 0) return {}

      return result[0];

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")

    }
  }

  async getRatingByCourse(request: GetRatingByCourseReq) {
    try {
      const page = Number(request.query.page ? request.query.page : 1);
      const limit = Number(request.query.limit ? request.query.limit : 15);
      const skip = (page - 1) * limit;
      const pipe: any = [
        { $match: { courseId: new Types.ObjectId(request._id) } }
      ]

      if (request.query.rating) {
        pipe.push({ $match: { rating: request.query.rating } })
      }

      pipe.push(
        {
          $lookup: {
            from: 'users',
            let: { user: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
              { $project: { name: 1, avatar: 1, avatarSM: 1, avatarMD: 1 } }
            ],
            as: "user"
          }
        },
        { $unwind: "$user" }
      )

      if (request.query.keywords) {
        const regexText = regexName(request.query.keywords)
        pipe.push({
          $match: {
            $or: [{ feedback: regexText }, { 'user.name': regexText }]
          }
        })
      }

      pipe.push(
        { $sort: { composite: -1, createdAt: -1 } },
        { $skip: skip }, { $limit: limit }
      )

      this.feedbackRepository.setInstanceKey(request.instancekey)
      const result = await this.feedbackRepository.aggregate(pipe);

      return { result }
    } catch (err) {
      throw new GrpcInternalException(err)
    }
  }

  async addToFavorite(request: AddToFavoriteRequest): Promise<AddToFavoriteResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let ts = await this.courseRepository.findOne({
        _id: new Types.ObjectId(request._id),
      })

      if (!ts) {
        throw new GrpcInternalException("Not Found");
      }
      this.favoriteRepository.setInstanceKey(request.instancekey)
      let favorite = await this.favoriteRepository.findOneAndUpdate(
        {
          user: new Types.ObjectId(request.userId.toString()),
          itemId: ts._id,
          title: ts.title,
          type: "course",
          location: new Types.ObjectId(request.activeLocation)
        },
        {
          subjects: ts.subjects,
        },
        { upsert: true, new: true }
      );
      let id = favorite._id.toString()
      return { _id: id };
    } catch (ex) {
      Logger.log(ex);
      throw "Internal Server error"
    }
  }
  async removeFavorite(request: RemoveFavoriteRequest): Promise<RemoveFavoriteResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let ts = await this.courseRepository.findOne({
        _id: new Types.ObjectId(request._id),
      })

      if (!ts) {
        throw "Not Found";
      }
      this.favoriteRepository.setInstanceKey(request.instancekey)
      await this.favoriteRepository.findOneAndDelete({
        user: new Types.ObjectId(request.userId),
        itemId: new Types.ObjectId(request._id),
        type: "course",
      });


      return { status: "ok" };
    } catch (ex) {
      Logger.log(ex);

      throw "Internal Server error"
    }
  }
  async addFeedback(request: AddFeedbackRequest): Promise<AddFeedbackResponse> {
    try {
      this.feedbackRepository.setInstanceKey(request.instancekey)
      await this.feedbackRepository.create({
        user: new Types.ObjectId(request.user),
        courseId: new Types.ObjectId(request.courseId),
        rating: request.rating,
        comment: request.feedback
      })
      //update course average rating
      let allRating = await this.feedbackRepository.find(
        { courseId: new Types.ObjectId(request.courseId), rating: { $gt: 0 } },
        { rating: 1 }
      )

      if (!allRating.length) {

        return { courseRating: 0 }
      }
      let ratings = allRating.reduce((val, uc) => val + Number(uc.rating), 0);
      ratings = ratings / allRating.length;
      this.courseRepository.setInstanceKey(request.instancekey)
      await this.courseRepository.findOneAndUpdate(
        { _id: request.courseId },
        { $set: { rating: ratings, totalRatings: allRating.length } }
      );

      return { courseRating: ratings }

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async getRatingCountByCourse(request: GetRatingCountByCourseRequest) {
    try {
      let condition = {
        courseId: new Types.ObjectId(request.id)
      };
      if (request.keywords) {
        condition['comment'] = RegExp(request.keywords)
      }
      if (request.rating) {
        condition['rating'] = request.rating
      }
      this.feedbackRepository.setInstanceKey(request.instancekey)
      let result = await this.feedbackRepository.countDocuments(condition)
      return { count: result };

    } catch (err) {
      Logger.log(err);
      throw "Internal server error"
    }
  }
  async addSection(request: AddSectionRequest): Promise<AddSectionResponse> {
    try {
      console.log(request);
      
      const id = request._id
      if (id) {
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.find({
          _id: new Types.ObjectId(id),
        }, { id: 1 })
        if (!course) {
          throw { msg: "No Course Found" }
        }

        var sectionToAdd = {
          title: request.body.title,
          summary: request.body.summary,
          name: request.body.name,
          locked: request.body.locked,
          contents: request.body.contents,
        }
        if (
          sectionToAdd &&
          sectionToAdd.contents &&
          sectionToAdd.contents.length > 0
        ) {
          for (let i = 0; i < sectionToAdd.contents.length; i++) {
            if (
              sectionToAdd.contents[i] &&
              (sectionToAdd.contents[i].type === "quiz" ||
                sectionToAdd.contents[i].type === "assessment")
            ) {
              this.practiceSetRepository.setInstanceKey(request.instancekey)
              await this.practiceSetRepository.findOneAndUpdate(
                { _id: new ObjectId(sectionToAdd.contents[i].source) },
                { $addToSet: { courses: new ObjectId(id) } }
              );
            }
          }
        }
      }
      const upCrs = await this.courseRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          $push: { sections: sectionToAdd },
          $set: { lastModifiedBy: new Types.ObjectId(request.userId) },
        },
        { returnOriginal: false }
      )
      if (!upCrs) {

        throw { msg: "Unable to update" }
      } else {
        var lastElement = upCrs.sections.length;
        return { section: upCrs.sections[lastElement - 1] }

      }
    } catch (err) {
      Logger.log(err);

      throw new Error("Internal Server error");
    }
  }
  async updateSectionsOrder(request: UpdateSectionsOrderRequest): Promise<UpdateSectionsOrderResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.find({
        _id: new Types.ObjectId(request._id)
      },
        { _id: 1 }
      )
      if (!course) {
        throw { message: "No Course Found" }
      }
      let sections = request.sectionToAdd
      const upCrs = await this.courseRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(request._id) },
        { $set: { sections: sections, lastModifiedBy: new Types.ObjectId(request.userId) } }
      )
      return { _id: upCrs._id.toString() }
    } catch (err) {
      Logger.log(err);
      throw "Internal server Error"

    }
  }
  async updateCourseContent(request: UpdateCourseContentRequest) {
    try {

      if (request.courseId && request._id) {
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.findOne(
          { _id: new Types.ObjectId(request.courseId) }
        )
        if (course) {
          const d = await this.courseRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(request.courseId) },
            {
              $set: {
                "sections.$[].contents.$[inner].title": request.title,
                "sections.$[].contents.$[inner].summary": request.summary,
                "sections.$[].contents.$[inner].type": request.type,
                "sections.$[].contents.$[inner].note": request.note
                  ? request.note
                  : [],
                "sections.$[].contents.$[inner].source": new Types.ObjectId(request.source)
                  ? new Types.ObjectId(request.source)
                  : null,
              },
            }, {
            arrayFilters: [
              {
                "inner._id": { $eq: new Types.ObjectId(request._id) }
              }
            ]
          }
          )
          return { response: "ok" }
        } else {
          throw "No Course Found"
        }
      } else {
        throw "No Course Found"
      }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async deleteContent(request: DeleteContentRequest): Promise<DeleteContentResponse> {
    try {
      if (request.courseId && request.contentId) {
        this.courseRepository.setInstanceKey(request.instancekey)
        const content: any = await this.courseRepository.aggregate([
          { $match: { _id: new Types.ObjectId(request.courseId) } },
          { $unwind: "$sections" },
          { $unwind: "$sections.contents" },
          {
            $match: {
              "sections.contents._id": new Types.ObjectId(
                request.contentId
              ),
            },
          },
          {
            $project: {
              _id: 1,
              contents: "$sections.contents",
            },
          },
        ])

        if (content && content.length > 0) {
          if (
            content[0].contents.type === "assessment" ||
            content[0].contents.type === "quiz"
          ) {
            this.practiceSetRepository.setInstanceKey(request.instancekey)
            await this.practiceSetRepository.findOneAndUpdate(
              { _id: content.contents.source },
              {
                $pull: { courses: request.contentId }
              }
            )
          }
          let crs = await this.courseRepository.findOneAndUpdate(
            { _id: request.courseId },
            { $pull: { "sections.$[].contents": { _id: request.contentId } }, }
          )
          return { id: crs._id }
        } else {
          throw "No content Found"
        }

      }

      throw "Invalid"
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")

    }
  }
  async deleteSection(request: DeleteSectionRequest): Promise<DeleteSectionResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      const course = await this.courseRepository.findOne({
        _id: new Types.ObjectId(request.courseId)
      })
      if (!course) throw new Error("Not Found")
      for (let i = 0; i < course.sections.length; i++) {
        let section = course.sections[i];
        if (section._id.equals(new Types.ObjectId(request.sectionId))) {

          for (let content of section.contents) {
            if (content.type == "assessment" || content.type == "quiz") {
              this.practiceSetRepository.setInstanceKey(request.instancekey)
              await this.practiceSetRepository.findOneAndUpdate(
                { _id: content.source },
                { $pull: { courses: new Types.ObjectId(request.courseId) } }
              )
            }
          }
          course.sections.splice(i, 1);
          course.lastModifiedBy = new Types.ObjectId(request.userId)
          await this.courseRepository.findOneAndUpdate({ _id: new Types.ObjectId(request.courseId) }, course)
          break;
        }
      }
      return { id: course._id }
    } catch (err) {
      Logger.log(err);
      throw "Internal server error"
    }
  }
  async addContentFavorite(request: AddContentFavoriteRequest): Promise<AddContentFavoriteResponse> {
    this.courseRepository.setInstanceKey(request.instancekey)
    let course = await this.courseRepository.findOne({
      _id: new Types.ObjectId(request.id),
      status: "published"
    })
    if (!course) {
      throw "Course Not Found"
    }

    let content = null;
    for (let i = 0; i < course.sections.length; i++) {
      content = course.sections[i].contents.find((c) =>
        c._id.equals(new Types.ObjectId(request.contentId))
      );
      if (content) {
        break;
      }
    }
    if (!content) {
      throw new Error("Not Found")
    }
    this.favoriteRepository.setInstanceKey(request.instancekey)
    let favorite = await this.favoriteRepository.findOneAndUpdate(
      {
        user: new Types.ObjectId(request.userId),
        itemId: new Types.ObjectId(content._id),
        "course._id": course._id,
        type: "content",
        location: new Types.ObjectId(request.activeLocation),
      },
      {
        "course.title": course.title,
        title: content.title,
        subjects: course.subjects,
      },
      { upsert: true, new: true }
    );
    return { id: favorite._id.toString() }
  }
  async removeContentFavorite(request: RemoveContentFavoriteRequest): Promise<RemoveContentFavoriteResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findOne({
        _id: new Types.ObjectId(request.id)
      })
      if (!course) throw new Error("Not Found")
      this.favoriteRepository.setInstanceKey(request.instancekey)
      await this.favoriteRepository.findOneAndDelete({
        user: new Types.ObjectId(request.userId),
        itemId: new Types.ObjectId(request.contentId),
        type: "content"
      })
      return { status: "Ok" }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server error")
    }
  }
  async getFavoriteCourse(request: GetFavoriteCourseRequest) {
    try {
      this.favoriteRepository.setInstanceKey(request.instancekey)
      let course = await this.favoriteRepository.distinct(
        "course", {
        type: "content",
        user: new Types.ObjectId(request.userId),
        location: new Types.ObjectId(request.activeLocation)
      }
      )

      return { response: course }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  /* 
    TODO: Add Location filter
    test on ID: 622b98c27083db4d0e069480
  */
  async getOngoingClasses(request: GetOngoingClassesRequest) {
    try {
      if (request.courseId) {
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.find(
          { _id: request.courseId },
          { _id: 1, classrooms: 1 }
        )
        if (!course) {
          throw new Error("Not Found")
        }
        let condition = {}
        if (request.role !== "publisher") {
          condition["cls.location"] = new Types.ObjectId(request.activeLocation)
        }
        const res = await this.courseRepository.aggregate([
          {
            $match: { _id: new Types.ObjectId(request.courseId) }
          },
          {
            $unwind: "$classrooms",
          },
          {
            $lookup: {
              from: "classrooms",
              localField: "classrooms",
              foreignField: "_id",
              as: "cls",
            },
          },
          { $unwind: "$cls" },
          { $match: condition },
          {
            $project: {
              _id: 1,
              classroomId: "$cls._id",
              title: "$cls.name",
              seqCode: "$cls.seqCode",
              students: { $size: "$cls.students" },
              imageUrl: "$cls.imageUrl",
              colorCode: "$cls.colorCode",
            },
          },
        ])
        if (!res) {
          throw new Error("Not Found")
        };
        return { response: res }
      }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server error")
    }
  }
  //ID: 622b98c27083db4d0e069480
  async getCourseProgress(request: GetCourseProgressRequest): Promise<GetCourseProgressResponse> {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findOne({ _id: (request.courseId) });

      let totalContent = 0;
      course.sections
        .filter((sec) => sec.status == "published")
        .forEach((sec) => {
          totalContent += sec.contents.filter((c) => c.active).length;
        });
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.findOne(
        { user: new Types.ObjectId(request.userId), course: new Types.ObjectId(request.courseId) }
      )
      if (userCourse && userCourse.contents && userCourse.contents.length) {
        let completedContents = userCourse.contents.filter(
          (c) => c.completed
        ).length
        let progress = Math.floor((completedContents / totalContent) * 100);
        return {
          response: {
            progress: progress > 100 ? 100 : progress,
            totalContent: totalContent,
            completedContents: completedContents
          }
        }
      } else {
        return {
          response: {
            progress: 0,
            totalContent: totalContent,
            completedContents: 0
          }
        }
      }
    } catch (err) {
      throw new GrpcInternalException(err.message)
    }
  }

  //ID:622b98c27083db4d0e069480
  async getUserCourse(request: GetUserCourseRequest) {
    try {
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.findOne({
        user: new Types.ObjectId(request.userId),
        course: new Types.ObjectId(request.id)
      })
      if (!userCourse) {
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.findOne({
          _id: new Types.ObjectId(request.id),
          status: "published",
          $or: [
            {
              expiresOn: {
                $gt: new Date(),
              }
            }, {
              expiresOn: null,
            }, {
              expiresOn: "",
            }
          ]
        })
        if (!course) {
          throw { message: "Course expired or does not exist" };
        }
        if (course.accessMode == "invitation") {
          this.classroomRepository.setInstanceKey(request.instancekey)
          let hasClass = await this.classroomRepository.findOne({
            _id: { $in: course.classrooms },
            "students.studentUserId": request.userId,
            active: true,
          })
          if (!hasClass) {
            throw { message: "You are not authorized to access this course" }
          }
        } else if (course.accessMode == "buy") {
          this.userEnrollmentRepository.setInstanceKey(request.instancekey)
          let isBought = await this.userEnrollmentRepository.findOne({
            user: new Types.ObjectId(request.userId),
            item: new Types.ObjectId(request.id),
            type: "course",
          })
          if (!isBought) {
            if (request.demoSection) {
              let section = course.sections.find((s) => s._id.equals(request.demoSection) && s.active && s.isDemo);
              if (section) {
                let data = {
                  user: new Types.ObjectId(request.userId),
                  userRole: request.userRole.toString(),
                  course: new Types.ObjectId(request.id),
                  location: new Types.ObjectId(request.activeLocation),
                }
                data["createdBy"] = course.user._id
                data["sections"] = [{
                  _id: section._id,
                  title: section.title,
                  completed: false,
                  analytics: {
                    quiz: 0,
                    test: 0,
                    attempt: 0,
                    pending: 0,
                    accuracy: 0
                  }
                }]


                let courseContent = section.contents[0];
                data["contents"] = [{
                  _id: courseContent._id,
                  section: section._id,
                  source: courseContent.source,
                  type: courseContent.type,
                  title: courseContent.title,
                  start: new Date(),
                  completed: false,
                  timeSpent: 0,
                }]

                await this.userCourseRepository.create(data)
                return data
              }
            } else {
              throw "You need to buy this course"
            }
          }
        }

        userCourse = await this.userCourseRepository.create({
          user: new Types.ObjectId(request.userId,),
          userRole: request.userRole,
          course: new Types.ObjectId(request.id),
          location: new Types.ObjectId(request.activeLocation)
        })
      }
      this.feedbackRepository.setInstanceKey(request.instancekey)
      let fb = await this.feedbackRepository.findOne({
        courseId: new Types.ObjectId(request.userId),
        user: new Types.ObjectId(request.userId)
      })
      userCourse.feedback = fb ? fb.comment : "";
      return userCourse
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }

  /* 
  ID:66178c3cab74dc82e3a2f5d3
  status: tempt
  testMode: practice
  */
  async fetchTeacherAssessment(request: FetchTeacherAssessmentRequest) {
    try {
      let result = [];
      this.userRepository.setInstanceKey(request.instancekey)
      let usr = await this.userRepository.find({ _id: new Types.ObjectId(request.id) }, { _id: 1 })
      if (!usr) throw { msg: "No User Found" }
      let filter = {}
      filter["userInfo._id"] = new Types.ObjectId(request.id);
      if (request.status) {
        filter["status"] = request.status
      }
      if (request.testMode) {
        filter["testMode"] = request.testMode
        this.practiceSetRepository.setInstanceKey(request.instancekey)
        result = await this.practiceSetRepository.find(
          filter,
          {
            _id: 1,
            title: 1,
            totalQuestion: 1,
            totalTime: 1,
            subjects: 1,
            units: 1,
            testMode: 1,
            status: 1,
            statusChangedAt: 1,
            userInfo: 1
          }
        )
      } else {
        filter["testMode"] = { $nin: "learning" };
        result = await this.practiceSetRepository.find(
          filter,
          {
            _id: 1,
            title: 1,
            totalQuestion: 1,
            totalTime: 1,
            subjects: 1,
            units: 1,
            testMode: 1,
            status: 1,
            statusChangedAt: 1,
            userInfo: 1
          }
        )
      }
      return { result: result }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server error")
    }
  }

  async getClassesTimeSpent(request: GetClassesTimeSpentRequest) {
    try {
      if (request.id) {
        this.classroomRepository.setInstanceKey(request.instancekey)
        const cls = await this.classroomRepository.aggregate([
          {
            $unwind: "$students",
          },
          {
            $lookup: {
              from: "usercourses",
              localField: "students.studentId",
              foreignField: "user",
              as: "uc",
            }
          },
          {
            $unwind: "$uc"
          },
          { $unwind: "$uc.contents" },
          { $match: { _id: new Types.ObjectId(request.id) } },
          {
            $group: {
              _id: { course: "$uc.course", classroom: "$_id" },
              time: { $sum: "$uc.contents.timeSpent" },
            },
          },
          {
            $project: {
              clasroomId: "$_id.classroom",
              time: { $divide: ["$time", 60] },
            },
          },
        ])
        return { response: cls }
      } else {
        throw new Error("Not Found")
      }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server error")
    }
  }

  async getAuthors(request: GetAuthorsReq) {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let authors = await this.courseRepository.distinct("user");
      authors = authors.filter((a, i) => authors.findIndex((s) => a._id.toString() === s._id.toString()) === i);

      return { authors };
    } catch (err) {
      throw new GrpcInternalException(err.message)
    }
  }

  async getCourseSectionsReport(request: GetCourseSectionsReportRequest) {
    try {
      let condition = {
        user: new Types.ObjectId(request.studentId),
        course: new Types.ObjectId(request.courseId)
      }
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.aggregate([
        { $match: condition },
        {
          $project: {
            user: 1,
            course: 1,
            contents: {
              $filter: {
                input: "$contents",
                as: "c",
                cond: {
                  $and: [
                    { $eq: ["$$c.completed", true] },
                    {
                      $eq: [
                        "$$c.section",
                        new Types.ObjectId(request.section)
                      ]
                    },
                    {
                      $or: [
                        { $eq: ["$$c.type", "assessment"] },
                        { $eq: ["$$c.type", "quiz"] },
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        { $unwind: "$contents" },
        {
          $lookup: {
            from: "attemptdetails",
            let: { aid: "$contents.attempt" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$attempt", "$$aid"] } }
              },
              {
                $project: {
                  _id: 0,
                  QA: 1,
                }
              },
              {
                $unwind: "$QA"
              }
            ],
            as: "QA"
          }
        },
        { $unwind: "$QA" },

        {
          $group: {
            _id: "$contents.section",
            total: { $sum: 1 },
            partial: { $sum: { $cond: [{ $eq: ["$QA.QA.status", 5] }, 1, 0] } },
            skipped: { $sum: { $cond: [{ $eq: ["$QA.QA.status", 3] }, 1, 0] } },
            correct: { $sum: { $cond: [{ $eq: ["$QA.QA.status", 1] }, 1, 0] } },
            incorrect: { $sum: { $cond: [{ $eq: ["$QA.QA.status", 2] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$QA.QA.status", 4] }, 1, 0] } },
          },
        },

      ])
      let result = {}
      if (userCourse.length > 0) {
        result = { ...userCourse[0] }
      }
      return { response: result }

    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"

    }
  }
  /* 
  CourseId: 62610cd4914dbc9d0ad92bea
  StudentId: 663876cafb87d1c60de1d068
  */
  async getStudentCourseOverview(request: GetStudentCourseOverviewRequest) {
    try {

      let condition = {
        user: new Types.ObjectId(request.studentId),
        course: new Types.ObjectId(request.courseId)
      }
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.aggregate([
        {
          $match: condition,
        },
        {
          $lookup: {
            from: "courses",
            let: { uid: "$course" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$uid"] } },
              },
              { $project: { title: 1, sections: 1, subjects: 1, accessMode: 1 } },
            ],
            as: "course"
          }
        },
        { $unwind: "$course" },
        {
          $project: {
            user: 1,
            updatedAt: 1,
            title: "$course.title",
            course: 1,
            sections: 1,
            subjects: "$course.subjects",
            accessMode: "$course.accessMode",
            contents: 1,
          }
        },
        {
          $lookup: {
            from: "users",
            let: { user: "$user" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$user"] } },
              },
              { $project: { name: 1, avatar: 1, avatarSM: 1, avatarMD: 1 } },
            ],
            as: "user"
          }
        },
        { $unwind: "$user" }
      ])
      let result: any = {};
      if (userCourse.length > 0) {
        result = { ...userCourse[0] };
        result.timeSpent = 0;
        result.totalContents = 0;
        result.completedContents = 0;

        result.contents.forEach((c) => {
          if (c.completed) {
            result.completedContents++;
          }
          if (c.timeSpent) {
            result.timeSpent += c.timeSpent;
          }
        });
        result.course.sections
          .filter((sec) => sec.status == "published")
          .forEach((sec) => {
            result.totalContents += sec.contents.length;
          });
        result.sections.forEach((s) => {
          let cs = result.course.sections.find((cs) => cs._id.equals(s._id));
          s.title = cs.title;
          s.totalContent = cs.contents.length;
          s.completedContents = result.contents.filter(
            (c) => c.completed && c.section.equals(s._id)
          ).length;
          s.progress = Math.floor((s.completedContents / s.totalContent) * 100);
          s.contents = result.contents.filter(
            (c) =>
              (c.type == "assessment" || c.type == "quiz") &&
              c.attempt && c.section.equals(s._id)
          )
        })
        result.sections = result.sections.filter(d => d.contents.length > 0);
        delete result.course;
        delete result.contents;
      }
      return { response: result }

    } catch (err) {
      Logger.log(err)
      throw "Internal Server Error"
    }
  }
  /* 
  CourseId: 62610cd4914dbc9d0ad92bea
  StudentId: 663876cafb87d1c60de1d068
  status: 3
  */
  async getCourseSectionByStatus(request: GetCourseSectionByStatusRequest) {
    try {
      let condition = {
        user: new Types.ObjectId(request.studentId),
        course: new Types.ObjectId(request.courseId)
      }
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.aggregate([
        {
          $match: condition,
        },
        {
          $project: {
            contents: {
              $filter: {
                input: "$contents",
                as: "c",
                cond: {
                  $and: [
                    { $eq: ["$$c.completed", true] },
                    {
                      $or: [
                        { $eq: ["$$c.type", "assessment"] },
                        { $eq: ["$$c.type", "quiz"] },
                      ],
                    },
                  ]
                }
              }
            }
          }
        },
        { $unwind: "$contents" },
        {
          $lookup: {
            from: "attemptdetails",
            let: { aid: "$contents.attempt" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$attempt", "$$aid"] } },
              },
              {
                $project: {
                  _id: "$attempt",
                  QA: {
                    $filter: {
                      input: "$QA",
                      as: "q",
                      cond: { $eq: ["$$q.status", parseInt(request.status)] },
                    },
                  },
                },
              },
            ],
            as: "contents.attempt",
          },
        },
        { $unwind: "$contents.attempt" },
        {
          $group: { _id: "$contents.section", contents: { $push: "$contents" } },
        }
      ])
      let result = [];
      for (let pendingSec of userCourse) {
        pendingSec.contents = pendingSec.contents.filter((c: any) => c.attempt.QA.length > 0);
        if (pendingSec.contents?.length > 0) {
          result.push(pendingSec)
        }

      }
      return { response: result }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"
    }
  }
  async verifyCourseUserProgress(request: VerifyCourseUserProgressRequest) {
    try {
      this.certificateRepository.setInstanceKey(request.instancekey)
      var certificate = await this.certificateRepository.findOne({
        course: new Types.ObjectId(request.courseId),
        issuedTo: new Types.ObjectId(request.userId)
      })

      if (certificate) {
        this.userCourseRepository.setInstanceKey(request.instancekey)
        var uc = await this.userCourseRepository.updateOne(
          {
            user: new Types.ObjectId(request.userId),
            course: new Types.ObjectId(request.courseId)
          },
          { $set: { issuedCertificate: true, issuedCertificateDate: new Date() } }
        );

        return { response: "ok" }
      }
      let course = await this.courseRepository.findOne({
        _id: new Types.ObjectId(request.courseId)
      })
      let optionalContents = [];
      let mandatoryContents = [];
      let incompleteContent = [];

      course.sections
        .filter((sec) => sec.status == "published")
        .forEach((sec) => {
          for (let c of sec.contents) {
            if (c.active) {
              if (sec.optional || c.optional) {
                optionalContents.push(c._id.toString());
              } else {
                mandatoryContents.push(c)
              }
            }
          }
        });
      var courseProgress = {
        progress: 0,
        completedContents: 0,
        totalContent: mandatoryContents.length,
      }
      let userCourse = await this.userCourseRepository.findOne({
        user: new Types.ObjectId(request.userId),
        course: new Types.ObjectId(request.courseId)
      })
      if (userCourse && userCourse.contents && userCourse.contents.length) {
        incompleteContent = mandatoryContents.filter((mc) => {
          let mandatoryUserContent = userCourse.contents.find((uc) => uc._id.equals(mc._id));
          return !mandatoryUserContent || !mandatoryUserContent.completed;
        })
        courseProgress.completedContents = courseProgress.totalContent - incompleteContent.length;
        let progress = courseProgress.totalContent > 0
          ? Math.floor(
            (courseProgress.completedContents / courseProgress.totalContent) * 100
          ) : 100;
        courseProgress.progress = progress > 100 ? 100 : progress;
      }
      if (courseProgress.progress < 100 && incompleteContent.length) {
        return {
          response: ("You have not completed the course (" +
            Math.round(courseProgress.progress) +
            "% complete). Please complete the course content " +
            incompleteContent[0].title +
            " and update your profile before trying again.")
        }
      }
      if (courseProgress.progress < 100) {
        return {
          response
            : (
              "You have not completed the course (" +
              Math.round(courseProgress.progress) +
              "% complete). Please complete the course content and update your profile before trying again."
            )
        };
      }
      let allTestIds = userCourse.contents.filter((c) => optionalContents.indexOf(c._id.toString()) == -1 &&
        (c.type == "quiz" || c.type == "assessment")).map((c) => c.source)
      if (allTestIds.length) {
        let scores: any = await this.attemptRepository.aggregate([
          {
            $match: {
              user: new Types.ObjectId(request.userId),
              practicesetId: { $in: allTestIds },
              isAbandoned: false,
            },
          },
          {
            $sort: { updatedAt: -1 }
          },
          {
            $group: {
              _id: "$practicesetId",
              totalMark: { $first: "$totalMark" },
              maxMark: { $first: "$maximumMarks" },
            }
          },
          {
            $group: {
              _id: null,
              totalMark: { $sum: "$totalMark" },
              maxMark: { $sum: "$maxMark" },
            }
          }
        ])
        if (scores.length) {
          let accuracy =
            scores[0].maxMark > 0 ? (scores[0].totalMark / scores[0].maxMark) * 100 : 100;
          if (accuracy < 40) {
            return { response: ("You have scored less than 40% of marks in this course. Please re-attempt the quiz/assessment.") }
          }
        }
      }
      var uc = await this.userCourseRepository.updateOne(
        { user: new Types.ObjectId(request.userId), course: new Types.ObjectId(request.courseId) },
        { $set: { issuedCertificate: true, issuedCertificateDate: new Date() } }
      );
      return { response: "ok" }

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async publicEnrolledCourse(request: PublicEnrolledCourseRequest) {
    try {
      if (request.studentId) {
        this.userRepository.setInstanceKey(request.instancekey)
        let user = await this.userRepository.findOne(
          { _id: new Types.ObjectId(request.studentId) }
        )
        if (user) {

          let userCourse: any = await this.userCourseRepository.find(
            { user: new Types.ObjectId(request.studentId) }
          )
          userCourse = await this.userCourseRepository.populate(userCourse, { path: "course", select: "title subjects" })

          return { response: userCourse }
        } else {
          throw response.status(404).send("No student found")
        }
      }
      else {
        throw response.status(404).send("No student found")
      }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }

  async getCourseContentAnalytics(request: GetCourseContentAnalyticsRequest) {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findOne(
        { _id: new Types.ObjectId(request.id) },
        { title: 1, subjects: 1, sections: 1 }
      )
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.findOne(
        { course: new Types.ObjectId(request.id), user: new Types.ObjectId(request.userId) },
        { sections: 1, contents: 1 }
      )
      if (!course || !userCourse) {
        throw new Error("Not Found")
      }
      return { course, userCourse }

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")

    }
  }
  async getCourseSubject(request: GetCourseSubjectRequest) {
    try {
      let condition: any = await this.baseFilter(request);
      condition.status = "published";
      if (request.excludeEnrolled) {
        this.userEnrollmentRepository.setInstanceKey(request.instancekey)
        let enrolledCourses = await this.userEnrollmentRepository.distinct("item", {
          user: new Types.ObjectId(request.userId),
          type: "course",
          $or: [
            {
              expiresOn: {
                $gt: new Date()
              }
            }, {
              expiresOn: null
            }
          ]
        });
        condition._id = { $nin: enrolledCourses };
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      let subjects = await this.courseRepository.distinct("subjects", condition);
      subjects = subjects.filter((s, index) => {
        let previousIndex = subjects.findIndex((item) => item.name == s.name);
        return previousIndex == index
      });
      subjects = subjects.filter((v, i, a) =>
        a.findIndex((v2) => v2._id.toString() == v._id.toString()) == i);
      return { response: subjects }
    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }
  async getStudentCourses(request: GetStudentCoursesRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 50;
      var skip = (page - 1) * limit;
      let condition = await this.baseFilter(request);
      this.courseRepository.setInstanceKey(request.instancekey)
      let allCourses = await this.courseRepository.aggregate([
        {
          $match: condition
        },
        {
          $sort: {
            updatedAt: -1
          }
        },
        {
          $limit: limit
        },
        {
          $skip: skip
        },
        {
          $project: {
            title: 1,
            sections: 1,
            type: 1,
            subjects: 1,
            imageUrl: 1,
            colorCode: 1,
          }
        }
      ])
      let result = [];
      for (let i = 0; i < allCourses.length; i++) {
        let course = allCourses[i];
        this.userCourseRepository.setInstanceKey(request.instancekey)
        let userCourse = await this.userCourseRepository.findOne(
          { user: request.userId, course: course._id }
        )
        let totalContent = 0;
        course.sections
          .filter((sec) => sec.status == "published")
          .forEach((sec) => {
            totalContent += sec.contents.filter((c) => c.active).length
          });
        let completedContents = 0;
        let progress = 0;
        if (userCourse) {
          completedContents = userCourse.contents.filter(
            (c) => c.completed
          ).length
          progress = Math.floor((completedContents / totalContent) * 100)
        }

        result.push({
          _id: course._id,
          title: course.title,
          progress: progress > 100 ? 100 : progress,
          type: course.type,
          subject: course.subjects,
          imageUrl: allCourses[i].imageUrl,
          colorCode: allCourses[i].colorCode,
        })
      }
      return { response: result }

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  /* 
  TODO: implement location filter
  */
  async getTeacherHighestPaidCourses(request: GetTeacherHighestPaidCoursesRequest) {
    try {
      let page = request.page ? request.page : 1;
      let limit = request.limit ? request.limit : 15;
      let skip = (page - 1) * limit;
      let allCourses = [];
      let condition: any = {
        $or: [
          {
            expiresOn: {
              $gt: new Date()
            },
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: "",
          }
        ],
        status: "published",
        accessMode: "buy",
        active: true,
      };
      if (request.userRole == "publisher") {
        condition["user._id"] = request.userId;
      } else {
        condition.locations = new Types.ObjectId(request.activeLocation)
      }
      if (request.userRole == "teacher") {
        condition["user._id"] = { $ne: request.userId };
        condition["instructors._id"] = { $ne: request.userId };
      }
      if (request.title) {
        let regexText = RegExp(request.title);
        condition["title"] = regexText;
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      allCourses = await this.courseRepository.aggregate([
        {
          $match: condition,
        },
        {
          $project: {
            title: 1,
            status: 1,
            type: 1,
            instructors: 1,
            imageUrl: 1,
            rating: 1,
            totalRatings: 1,
            subjects: 1,
            accessMode: 1,
            countries: 1,
            marketPlacePrice: 1,
          }
        },
        {
          $lookup: {
            from: "userenrollments",
            let: { cid: "$_id" },
            pipeline: [
              {
                $match: { accessMode: "buy", $expr: { $eq: ["$item", "$$cid"] } },
              },
              {
                $group: { _id: "$item", price: { $sum: "$price" } }
              },
            ],
            as: "purchaseHistory"
          },
        },
        { $unwind: "$purchaseHistory" },
        {
          $project: {
            title: 1,
            status: 1,
            totalRatings: 1,
            imageUrl: 1,
            instructors: 1,
            type: 1,
            rating: 1,
            subjects: 1,
            accessMode: 1,
            price: "$purchaseHistory.price",
            discountValue: 1,
            countries: 1,
          }
        },
        {
          $sort: {
            price: -1
          }
        },
        {
          $limit: limit
        }
      ])
      return { response: allCourses }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  /* 
    TODO: activelocation and setPriceBycountry filter
  */
  async getTopCategoriesCourse(request: GetTopCategoriesCourseRequest) {
    try {
      var page = Number(request.page || 1);
      var limit = Number(request.limit || 20);
      let skip = (page - 1) * limit;
      let condition = {
        accessMode: 'buy',
        status: "published",
        locations: new Types.ObjectId(request.activeLocation),
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            },
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: "",
          }
        ],
      };
      let courses = await this.courseRepository.aggregate([
        {
          $match: condition
        },
        {
          $sort: {
            "updatedAt": -1
          }
        },
        {
          $limit: limit
        },
        {
          $skip: skip
        }
      ])
      return { response: courses }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }

  /*
    !Todo: SetPriceByCountry
  */
  async getPublisherCourse(request: GetPublisherCourseRequest) {
    try {
      var limit = Number(request.limit || 4);
      var page = Number(request.page || 1);
      var skip = (page - 1) * limit;
      if (request.skip) {
        skip = Number(request.skip)
      }
      let match: any = {
        origin: "publisher",
        accessMode: "buy",
        status: "published",
        $and: [
          {
            $or: [
              {
                expiresOn: {
                  $gt: new Date(),
                }
              },
              {
                expiresOn: null
              },
              {
                expiresOn: "",
              }
            ]
          }
        ]
      }
      if (request.title) {
        match.title = {
          $regex: escapeRegex(request.title),
          $options: "i",
        }
      }
      let pipeline: any = [
        {
          $match: match
        }
      ];
      if (request.count) {
        pipeline.push({ $count: "total" });
        let coursesCount: any = await this.courseRepository.aggregate(pipeline);

        return { count: coursesCount }
      }
      pipeline.push({ $skip: skip }, { $limit: limit });
      pipeline.push({
        $project: {
          title: 1,
          colorCode: 1,
          imageUrl: 1,
          totalRatings: 1,
          rating: 1,
          level: 1,
          duration: 1,
          countries: 1,
          accessMode: 1,
          subjects: 1,
          instructors: 1,
          user: 1,
          statusChangedAt: 1,
          type: 1,
          status: 1,
          startDate: 1,
          expiresOn: 1,
          sections: 1,
        }
      });
      let courses: any = await this.courseRepository.aggregate(pipeline);
      for (let course of courses) {
        let enrolled = await this.userEnrollmentRepository.findOne(
          {
            item: course._id,
            user: request.userId,
            location: new Types.ObjectId(request.activeLocation)
          },
          { _id: 1 }
        )
        course.enrolled = !!enrolled
        await this.settings.setPriceByUserCountry(request, course)
      }
      return { response: courses }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async userWithoutEnroll(request: UserWithoutEnrollRequest) {
    try {
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.findOne({
        user: new Types.ObjectId(request.userId)
      })
      if (!userCourse) {
        let condition = await this.baseFilter(request);
        condition["status"] = "published";
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.aggregate([
          {
            $match: condition
          },
          {
            $sort: {
              "updatedAt": -1
            }
          },
          {
            $limit: 1
          },
          {
            $project: {
              title: 1,
              _id: 1
            }
          }
        ])
        return { response: course };
      }
      return { response: [] };
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async getCourseMembers(request: GetCourseMembersRequest) {
    var result = [];
    var page = request.page ? request.page : 1;
    var limit = request.limit ? request.limit : 20;
    var skip = (page - 1) * limit;
    try {
      let userCourse = [];
      let totalCount = 0;
      let pipe: any = [
        { $match: { course: new Types.ObjectId(request.courseId) } },
        {
          $lookup: {
            from: "users",
            let: { uid: "$user" },
            pipeline: [
              {
                $match: { role: "student", $expr: { $eq: ["$_id", "$$uid"] } },
              },
              { $project: { name: 1, userId: 1, email: 1, avatar: 1, role: 1 } },
            ],
            as: "userInfo"
          },
        },
        {
          $unwind: "$userInfo",
        },
      ];

      if (request.searchText) {
        pipe.push({
          $match: {
            $or: [
              {
                "userInfo.name": {
                  $regex: escapeRegex(request.searchText),
                  $options: "i"
                }
              },
              {
                "userInfo.email": {
                  $regex: escapeRegex(request.searchText),
                  $options: "i",
                },
              },
            ],
          }
        });
      }
      pipe.push({
        $facet: {
          count: [{ $count: "total" }],
          users: [{ $skip: skip }, { $limit: limit }],
        }
      })
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let results: any = await this.userCourseRepository.aggregate(pipe);
      if (results[0]) {
        userCourse = results[0].users;
        totalCount = results[0].count[0] ? results[0].count[0].total : 0;
      }
      let course = await this.courseRepository.findOne({
        _id: request.courseId
      })
      for (var i = 0; i < userCourse.length; i++) {
        if (userCourse[i].course) {
          var isCerti = false;
          this.certificateRepository.setInstanceKey(request.instancekey)
          var certificates = await this.certificateRepository.findOne({
            course: new Types.ObjectId(request.courseId),
            issuedTo: userCourse[i].user
          })
          if (certificates) {
            isCerti = true;
          }
          let totalContent = [];
          if (course && course.sections) {
            course.sections
              .filter((sec) => sec.status == "published")
              .forEach((sec) => {
                totalContent += sec.contents.filter((c) => c.active)
              });
            let completedContents = userCourse[i].contents.filter(
              (c) => c.completed
            ).length;
            if (completedContents > totalContent.length) {
              completedContents = totalContent.length;
            }
            let progress = Math.floor((completedContents / totalContent.length) * 100);
            result.push({
              _id: course._id,
              progress: progress > 100 ? 100 : progress,
              totalContent: totalContent.length,
              completedContents: completedContents,
              student: userCourse[i].userInfo,
              lastActive: userCourse[i].updatedAt,
              isCerti: isCerti,
            })
          }
        }
      }
      return { result, totalCount }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }

  /*
   !Todo: SetPriceByCountry
 */
  async getTeacherCourse(request: GetTeacherCourseRequest) {
    try {
      let condition = { _id: new Types.ObjectId(request.courseId), active: true };
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findOne(condition)
      course = await this.courseRepository.populate(course, [{
        path: "instructors._id",
        select: "name avatar role gender designation knowAboutUs",
      }, {
        path: "user._id",
        select: "name avatar role gender designation knowAboutUs",
        options: { lean: true },
      }])
      if (!course) {
        throw { message: "Course expired or doesn't exist" };
      }
      await this.settings.setPriceByUserCountry(request, course)
      course.user = course.user?._id;
      course.instructors = course.instructors.map((d) => d._id);
      return { response: course }

    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  /* 
  TODO: Implement location filter
  */
  async getOngoingCourse(request: GetOngoingCourseRequest) {
    try {
      var limit = Number(request.limit || 1);
      let project = {};
      let sort = { 'updatedAt': -1 }
      if (request.home) {
        project = {
          course: 1,
          user: 1,
          contents: 1,
        }
      }
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourses = await this.userCourseRepository.find(
        { user: new ObjectId(request.userId), completed: false, active: true, location: new ObjectId(request.activeLocation) }, project,
        {
          sort: sort, limit: limit,
          populate: { path: 'course', select: "title colorCode imageUrl summary user", options: { lean: true } },
          lean: true
        }
      )
      userCourses = userCourses.filter((d) => d.course);
      const fuc = [];
      if (userCourses.length) {
        userCourses.forEach((uc) => {
          uc.contents = uc.contents.filter((d) => d.completed == false);
          if (uc.contents.length) {
            fuc.push(uc)
          }
        });
      }
      return { response: fuc }
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }

  async getOngoingCourseContent(request: GetOngoingCourseContentReq) {
    try {
      this.userCourseRepository.setInstanceKey(request.instancekey)
      const userCourses = await this.userCourseRepository.findOne(
        {
          user: new Types.ObjectId(request.userId),
          course: new Types.ObjectId(request.courseId),
          completed: false, active: true
        },
        undefined,
        { populate: { path: 'course', select: "title colorCode imageUrl summary user" }, lean: true }
      )

      if (userCourses) {
        const ongoingContent = userCourses.contents.find(d => !d.completed)
        if (ongoingContent) {
          const chapter = userCourses.sections.findIndex(d => d._id.toString() == ongoingContent.section.toString())
          return { title: ongoingContent.title, chapter: chapter + 1 }
        }
      }
      throw new NotFoundException('UserCourse not found.')
    } catch (error) {
      if (error instanceof (NotFoundException)) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }
  async editContentInSection(request: EditContentInSectionRequest) {
    try {
      if (request.courseId) {
        this.courseRepository.setInstanceKey(request.instancekey)
        let course = await this.courseRepository.find(
          { _id: request.courseId, "sections._id": request.sectionId },
          { _id: 1, sections: 1 }
        )
        if (!course) {
          throw { msg: "No Course Found" };
        }
        var oldSec = course[0].sections.filter(
          (s: any) => s._id.toString() === request.sectionId
        );
        var sectionToAdd = {
          title: request.title,
          summary: request.summary,
          name: request.name,
          locked: request.locked,
          optional: request.optional,
          contents: request.contents
        };
        let result = oldSec[0].contents.filter(
          (o1: any) => !sectionToAdd.contents.some(
            (o2: any) => o2._id && o1._id.toString() === o2._id.toString()
          )
        );
        if (result && result.length > 0) {
          result.forEach(async (r) => {
            if (r.type === "assessment" || r.type === "quiz") {
              this.practiceSetRepository.setInstanceKey(request.instancekey)
              await this.practiceSetRepository.findOneAndUpdate(
                { _id: new Types.ObjectId(r.source) },
                {
                  $pull: { courses: new Types.ObjectId(request.courseId) }
                }
              )
            }
          })
        }
        for (let i = 0; i < sectionToAdd.contents.length; i++) {
          if (sectionToAdd.contents[i] && (sectionToAdd.contents[i].type == "quiz" || sectionToAdd.contents[i].type === "assessment")) {
            await this.practiceSetRepository.findOneAndUpdate(
              { _id: sectionToAdd.contents[i].source },
              { $addToSet: { courses: new Types.ObjectId(request.courseId) } }
            )
          }
        }
        let newcrs = await this.courseRepository.findOneAndUpdate(
          { _id: new Types.ObjectId(request.courseId) },
          {
            $set: {
              "sections.$[element].title": sectionToAdd.title,
              "sections.$[element].summary": sectionToAdd.summary,
              "sections.$[element].contents": sectionToAdd.contents,
              "sections.$[element].name": sectionToAdd.name,
              "sections.$[element].locked": sectionToAdd.locked,
              "sections.$[element].optional": sectionToAdd.optional,
              lastModifiedBy: new Types.ObjectId(request.userId),
            }
          },
          {
            arrayFilters: [{ "element._id": { $eq: new Types.ObjectId(request.sectionId) } }],
            returnOriginal: false
          }
        )
        if (!newcrs) {
          throw "Please Try Again"
        }
        for (let i = 0; i < newcrs.sections.length; i++) {
          for (let j = 0; j < newcrs.sections[i].contents.length; j++) {
            if (newcrs.sections[i].contents[j].type == "assessment" ||
              newcrs.sections[i].contents[j].type == "quiz"
            ) {
              let practice: any = await this.practiceSetRepository.findOne(
                { _id: newcrs.sections[i].contents[j].source },
                { _id: 1, status: 1, questions: 1 },
              )
              practice = await this.practiceSetRepository.populate(practice, { path: "questions.question", select: "_id category" })
              newcrs.sections[i].contents[j].practiceStatus = practice.status;
              if (practice.questions && practice.questions.length) {
                newcrs.sections[i].contents[j].questions = practice.questions.map(
                  (e) => e.question
                )
              } else {
                newcrs.sections[i].contents[j].questions = []
              }
            }
          }
        }
        return { response: newcrs }
      }
      throw "Enter Course Id"
    } catch (err) {
      Logger.log(err);
      throw new Error("Internal Server Error")
    }
  }
  async getAllMyCourseProgress(request: GetAllMyCourseProgressRequest) {
    try {
      var result = [];
      let status: any = { $ne: 'draft' };
      if (request.status) {
        status = request.status
      }
      let filter: any = {
        user: new Types.ObjectId(request.userId)
      }
      if (request.userRole !== "mentor") {
        filter.location = new Types.ObjectId(request.activeLocation)
      }
      this.userEnrollmentRepository.setInstanceKey(request.instancekey)
      let allPurchasedUserCourse = await this.userEnrollmentRepository.aggregate([
        {
          $match: {
            type: "course",
            ...filter
          }
        },
        {
          $sort: {
            "updatedAt": -1
          }
        }
      ]);
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let userCourse = await this.userCourseRepository.aggregate([
        {
          $match: filter
        },
        {
          $sort: {
            "updatedAt": -1
          }
        }
      ])
      for (var i = 0; i < userCourse.length; i++) {
        if (userCourse[i].course) {
          this.courseRepository.setInstanceKey(request.instancekey)
          let course = await this.courseRepository.findOne(
            { _id: userCourse[i].course, status: status }
          )
          let totalContent = [];
          if (course && course.sections) {
            course.sections
              .filter((sec) => sec.status == "published")
              .forEach((sec) => {
                totalContent += sec.contents.filter((c) => c.active)
              });
            let completedContents = userCourse[i].contents.filter(
              (c) => c.completed
            ).length;
            let progress = Math.floor((completedContents / totalContent.length) * 100);
            result.push({
              _id: course._id,
              title: course.title,
              progress: progress > 100 ? 100 : progress,
              type: course.type,
              subjects: course.subjects,
              colorCode: course.colorCode,
              imageUrl: course.imageUrl,
              status: course.status
            })
          }
        }
      }
      const notStartedCoursees = allPurchasedUserCourse.filter(
        ({ item: id1 }) => !result.some(({ _id: id2 }) => id2.toString() === id1.toString())
      );
      for (var i = 0; i < notStartedCoursees.length; i++) {
        if (notStartedCoursees[i].item && notStartedCoursees[i].type == "course") {
          let course = await this.courseRepository.findOne(
            {
              _id: notStartedCoursees[i].item,
              status: status
            }
          )
          let totalContent = [];
          if (course && course.sections) {
            course.sections
              .filter((sec) => sec.status == "published")
              .forEach((sec) => {
                totalContent += sec.contents.filter((c) => c.active)
              });
            let completedContents = 0;
            let progress = Math.floor((completedContents / totalContent.length) * 100);
            result.push({
              _id: course._id,
              title: course.title,
              progress: progress > 100 ? 100 : progress,
              type: course.type,
              subjects: course.subjects,
              colorCode: course.colorCode,
              imageUrl: course.imageUrl,
              status: course.status,
            })
          }
        }
      }
      return { response: result }
    } catch (err) {
      Logger.log(err);
      throw "New Internal Server Error"
    }
  }

  async getCoursePublic(request: GetCoursePublicReq) {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findOne({ _id: new Types.ObjectId(request.courseId) })
      course = await this.courseRepository.populate(course, [
        { path: "instructors._id", select: "name avatar role gender designation knowAboutUs email" },
        { path: "user._id", select: "name avatar role gender designation knowAboutUs email" }
      ])
      if (!course) {
        let relatedCourses = await this.courseRepository.find(
          {
            status: "published",
            $or: [
              {
                expiresOn: {
                  $gt: new Date(),
                }
              },
              {
                expiresOn: null,
              },
              {
                expiresOn: "",
              }
            ],
            accessMode: "buy",
          },
          { sections: 0 },
          { limit: 6 }
        )
        return { response: relatedCourses }
      } else {
        if (course.status != "published" || (
          course.expiresOn && new Date().getTime() - new Date(course.expiresOn).getTime() > 0
        )) {
          let relatedCourses = await this.courseRepository.find(
            {
              status: "published",
              accessMode: "public",
              $or: [
                {
                  expiresOn: {
                    $gt: new Date(),
                  },
                },
                {
                  expiresOn: null,
                },
                {
                  expiresOn: ""
                }
              ],
              subjects: { $in: course.subjects },
            },
            { sections: 0 },
            { limit: 6 }
          )
          return { response: relatedCourses }
        }
      }
      course.user = course.user._id;
      course.instructors = course.instructors
        .filter((i) => !!i._id)
        .map((d) => d._id);
      if (course.user.role != "admin") {
        if (!course.instructors.find((i) => i._id.equals(course.user._id))) {
          course.instructors.unshift(course.user);
        }
      }
      course.enrolled = false;
      if (request.userId) {
        this.userEnrollmentRepository.setInstanceKey(request.instancekey)
        course.enrolled = !!(await this.userEnrollmentRepository.findOne({
          type: "course",
          item: new Types.ObjectId(request.courseId),
          user: new Types.ObjectId(request.courseId)
        }))
      }
      course.enrolledUsers = this.userEnrollmentRepository.countDocuments(
        {
          type: "course",
          item: new Types.ObjectId(request.courseId)
        }
      )
      await this.settings.setPriceByUserCountry(request, course)
      return { response: course }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getTeacherCourseDetail(request: GetTeacherCourseDetailRequest) {
    try {
      let condition = { _id: new Types.ObjectId(request.courseId) };
      if (await validateAccess(request, request.courseId)) {
        let course = await this.courseRepository.findOne(condition)
        course = await this.courseRepository.populate(course, [
          {
            path: "instructors._id",
            select: "avatar name _id",
          },
          {
            path: "classrooms",
            select: "_id name",
          },
          {
            path: "locations",
            select: "_id name"
          },
          {
            path: "lastModifiedBy",
            select: "_id name"
          }
        ])
        if (!course) {
          throw { message: "Course expired or does not exist" };
        }
        for (let i = 0; i < course.sections.length; i++) {
          for (let j = 0; j < course.sections[i].contents.length; j++) {
            if (course.sections[i].contents[j].type == "assessment" ||
              course.sections[i].contents[j].type == "quiz"
            ) {
              this.practiceSetRepository.setInstanceKey(request.instancekey)
              let practice = await this.practiceSetRepository.findOne(
                { _id: course.sections[i].contents[j].source },
                { _id: 1, status: 1, questions: 1, title: 1 },


              )
              practice = await this.practiceSetRepository.populate(practice, {
                path: "questions.question",
                select: "_id category"
              })
              course.sections[i].contents[j].practiceStatus = practice?.status;
              course.sections[i].contents[j].title = practice?.title;

              if (practice?.questions && practice?.questions.length) {
                course.sections[i].contents[j].questions = practice.questions.map(
                  (e) => e.question
                );
              } else {
                course.sections[i].contents[j].questions = []
              }
            }
          }
        }
        if (course.instructors.length > 0) {
          course.instructors = course.instructors.map((d) => d._id);
        }
        
        return { response: course }
      }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async updateContentTimeSpent(request: UpdateContentTimeSpentRequest) {
    try {
      if (!request.timeSpent)
        throw "Bad request"
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let uc: any = await this.userCourseRepository.aggregate([
        {
          $match: {
            course: new Types.ObjectId(request.courseId),
            user: new Types.ObjectId(request.userId),
          },
        },
        {
          $unwind: "$contents"
        },
        {
          $match: {
            'contents._id': new Types.ObjectId(request.contentId)
          }
        },
        {
          $project: {
            "contents.completed": 1,
            "contents.timeSpent": 1,
          }
        }
      ])
      let timeSpent = uc[0].contents.timeSpent;
      if (uc && uc[0].contents.completed === false) {
        await this.userCourseRepository.updateOne(
          {
            course: new Types.ObjectId(request.courseId),
            user: new Types.ObjectId(request.userId),
            "contents._id": new Types.ObjectId(request.contentId)
          },
          {
            $set: {
              "contents.$.timeSpent": request.timeSpent,
            }
          },
        )
        timeSpent = request.timeSpent
      }
      return { timeSpent }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async completeContent(request: CompleteContentRequest) {
    try {
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let uc = await this.userCourseRepository.findOne({
        user: new Types.ObjectId(request.userId),
        course: new Types.ObjectId(request.courseId)
      })
      if (!uc || !uc.active) {
        throw "Not Found"
      }
      let content = uc.contents.find(c => c._id.equals(new Types.ObjectId(request.contentId)));
      if (!content) throw "Nott Found"
      if (content.completed) {
        let completedContents = uc.contents.filter((c) => c.completed);
        return { completedContents: completedContents.length }
      }
      content.end = new Date();
      content.completed = true;
      content.timeSpent = request.timeSpent;

      let completedContents = uc.contents.filter((c) => c.completed);
      this.courseRepository.setInstanceKey(request.instancekey)
      let course = await this.courseRepository.findById(new Types.ObjectId(request.courseId));

      let finished = true;
      for (let sec of course.sections) {
        for (let content of sec.contents) {
          if (content.active) {
            //@ts-ignore
            if (content._id.equals(new Types.ObjectId(request.contentId)) &&
              (content.type == "quiz" || content.type == "assessment")) {
              await this.updateSectionAnalytics(request.instancekey, sec, uc);
            }
            //@ts-ignore
            let f = completedContents.findIndex((c) => c._id.equals(content._id));
            if (f == -1) {
              finished = false
            }
          }
        }
      }
      if (finished) {
        await this.userCourseRepository.findOneAndUpdate({
          user: new Types.ObjectId(request.userId),
          course: new Types.ObjectId(request.courseId),
          "contents._id": new Types.ObjectId(request.contentId)
        }, {
          $set: {
            "contents.$.completed": true
          }
        })
      }

      return { completedContents: completedContents.length }

    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"

    }
  }

  async startContent(request: StartContentRequest) {
    try {
      console.log(">>>>>>>>>>>", request);
      
      let course = await this.courseRepository.findById(request.courseId);
      console.log(course);
      
      if (!course) throw "Not Found"
      let uc = await this.userCourseRepository.findOne({
        user: new Types.ObjectId(request.user._id),
        course: new Types.ObjectId(request.courseId)
      })

      if (uc && !uc.active) {
        throw "Not Found"
      }
      if (!uc) {
        this.userCourseRepository.setInstanceKey(request.instancekey);
        uc = await this.userCourseRepository.create({
          user: new Types.ObjectId(request.user._id),
          userRole: request.user.roles ? request.user.roles[0] : '',
          course: new Types.ObjectId(request.courseId),
          location: new Types.ObjectId(request.user.activeLocation)
        })
      }
      let ucSection = uc.sections.find((s) => s._id.equals(new Types.ObjectId(request.section)));
      let sec = course.sections.find((s: any) => s._id.equals(new Types.ObjectId(request.section)));
      console.log(":::::::::::", sec);
      
      if (!ucSection) {
        ucSection = {
          _id: new Types.ObjectId(request.section),
          title: sec.title,
          completed: false,
          analytics: { quiz: 0, test: 0, attempt: 0, pending: 0, accuracy: 0 },
        }
        let nuc = await this.userCourseRepository.create(uc)
        await this.userCourseRepository.updateOne(
          {
            _id: nuc._id
          },
          {
            $push: { sections: ucSection }
          }
        )
      }
      let content = uc.contents?.find((c) => c._id.equals(new Types.ObjectId(request.content)));

      if (!content) {
        let courseContent = sec.contents.find((c: any) => c._id.equals(new Types.ObjectId(request.content)))
        // asyncFun.user.createCourseDefaultClassroom(req)
        content = {
          _id: new Types.ObjectId(request.content),
          section: new Types.ObjectId(request.section),
          source: new Types.ObjectId(courseContent.source),
          type: courseContent.type,
          title: courseContent.title,
          start: new Date(),
          updatedAt: new Date(),
          completed: false,
          timeSpent: 0
        };
        if (!uc.createdBy) {
          uc.createdBy = course.user._id;
        }

        await this.userCourseRepository.updateOne(
          {
            _id: uc._id
          },
          {
            $push: { contents: content }
          }
        )
      } else {
        await this.userCourseRepository.updateOne(
          {
            _id: uc._id,
            "contents._id": new Types.ObjectId(request.content)
          },
          {
            "contents.$.updatedAt": new Date()
          }
        )
      }
      let fav = await this.favoriteRepository.findOne({
        user: new Types.ObjectId(request.user._id),
        itemId: new Types.ObjectId(request.content)
      })
      let toreturn = {
        section: content.section,
        content: content._id,
        start: content.start,
        completed: content.completed,
        favorite: !!fav
      }
      return { ...toreturn }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }

  async getCourses(request: GetCoursesRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 12;
      var skip = (page - 1) * limit;

      let allCourses = [];
      var totalCount = 0;
      let condition: any = { active: true };
      if (!request.userRole.includes('publisher')) {
        condition.locations = new Types.ObjectId(request.userData.activeLocation);
      }
      if (request.keyword) {
        condition.title = this.regexName(request.keyword);
      }
      if (request.accessMode) {
        condition.accessMode = request.accessMode
      }

      if (request.userRole.includes('publisher') && request.userData.activeLocation) {
        this.locationRepository.setInstanceKey(request.instancekey)
        let ownLocation = await this.locationRepository.findOne(
          {
            _id: new Types.ObjectId(request.userData.activeLocation),
            user: new Types.ObjectId(request.userId)
          },
          { user: 1 }
        )
        if (ownLocation) {
          request.ownLocation = true;
          condition.$or = [
            {
              locations: new Types.ObjectId(request.userData.activeLocation)
            },
            {
              "user._id": new Types.ObjectId(request.userId)
            }
          ]
        } else {
          condition["user._id"] = new Types.ObjectId(request.userId)
        }
      }

      if (canOnlySeeHisOwnContents(request.userRole)) {
        condition.$or = [
          { "user._id": new Types.ObjectId(request.userId) },
          { "instructors._id": new Types.ObjectId(request.userId) }
        ]
      } else {
        limit = 12;
      }

      switch (request.type) {
        case "published":
          condition.status = "published";
          this.courseRepository.setInstanceKey(request.instancekey)
          console.log('condition', JSON.stringify(condition));
          const coursess: any = await this.courseRepository.aggregate([
            { $match: condition },
            {
              $project: {
                title: 1,
                expiresOn: 1,
                status: 1,
                imageUrl: 1,
                sections: 1,
                instructors: 1,
                type: 1,
                subjects: 1,
                accessMode: 1,
                summary: 1,
                countries: 1,
                updatedAt: 1
              }
            },
            {
              $lookup: {
                from: 'usercourses',
                let: { cid: '$_id' },
                pipeline: [
                  {
                    $match: {
                      userRole: 'student',
                      $expr: { $eq: ['$course', '$$cid'] }
                    }
                  },
                  { $project: { user: 1, updatedAt: 1, contents: 1 } },
                  { $unwind: '$contents' },
                  {
                    $group: {
                      _id: { course: '$course', user: '$user' },
                      updatedAt: { $first: '$updatedAt' },
                      timeSpent: { $sum: '$contents.timeSpent' }
                    }
                  },
                  {
                    $group: {
                      _id: '$_id.course',
                      updatedAt: { $first: '$updatedAt' },
                      students: { $sum: 1 },
                      timeSpent: { $sum: '$timeSpent' }
                    }
                  }
                ],
                as: 'stats'
              }
            },
            { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
            {
              $facet: {
                courses: [
                  { $sort: { updatedAt: -1 } },
                  { $skip: skip },
                  { $limit: limit },
                  {
                    $project: {
                      students: '$stats.students',
                      timeSpent: '$stats.timeSpent',
                      updatedAt: '$stats.updatedAt',
                      imageUrl: 1,
                      instructors: 1,
                      title: 1,
                      sections: 1,
                      countries: 1,
                      type: 1,
                      accessMode: 1,
                      subjects: 1
                    }
                  }
                ],
                count: [{ $count: 'total' }]
              }
            }
          ]);

          allCourses = coursess[0].courses;
          totalCount = coursess[0].count[0] ? coursess[0].count[0].total : 0;

          for (let course of allCourses) {
            await this.settings.setPriceByUserCountry(request, course)
          }
          break;
        case "draft":
          condition.status = "draft";
          let pipeline = [];
          pipeline.push({ $match: condition })
          pipeline.push({ $sort: { updatedAt: -1 } });
          if (request.userRole.includes('director')) {
            pipeline.push(
              {
                $lookup: {
                  from: "users",
                  localField: "user._id",
                  foreignField: "_id",
                  as: "userInfo",
                }
              },
              { $unwind: "$userInfo" },
              {
                $match: {
                  $expr: {
                    $cond: [
                      // { $in: ["publisher", "$userInfo.roles"] },
                      { $in: ["publisher", { $ifNull: ["$userInfo.roles", []] }] },
                      { $ne: ["$status", "draft"] },
                      {}
                    ]
                  }
                }
              }
            );
          }
          pipeline.push({
            $project: {
              title: 1,
              imageUrl: 1,
              instructors: 1,
              sections: 1,
              type: 1,
              subjects: 1,
              accessMode: 1,
              startDate: 1,
              countries: 1,
              classrooms: 1,
              updatedAt: 1,
              locations: 1,
            }
          });
          let countPipeline = [...pipeline];
          pipeline.push({ $skip: skip }, { $limit: limit });
          countPipeline.push({ $count: "total" });
          allCourses = await this.courseRepository.aggregate(pipeline);
          const tcc: any = await this.courseRepository.aggregate(countPipeline);
          totalCount = tcc[0] ? tcc[0].total : 0;
          break;
        case "ongoing":
        default:
          let courseFilter: any = {
            status: "published",
            active: true,
            $or: [
              {
                expiresOn: {
                  $gt: new Date(),
                },
              },
              {
                expiresOn: null,
              },
              {
                expiresOn: "",
              }
            ]
          }
          if (canOnlySeeLocationContents(request.userRole)) {
            condition.locations = new Types.ObjectId(request.userData.activeLocation)
          }
          if (canOnlySeeHisOwnContents(request.userRole)) {
            courseFilter["user._id"] = new Types.ObjectId(request.userId)
          }
          if (request.userRole.includes('publisher') && request.ownLocation) {
            courseFilter.$and = [
              {
                $or: [
                  {
                    locations: new Types.ObjectId(request.userData.activeLocation)
                  },
                  {
                    "user._id": new Types.ObjectId(request.userId)
                  }
                ]
              }
            ]
          } else {
            courseFilter["user._id"] = new Types.ObjectId(request.userId);
          }
          if (request.keyword) {
            courseFilter.title = {
              $regex: request.keyword,
              $options: "i"
            }
          }
          this.courseRepository.setInstanceKey(request.instancekey)
          let ongoingResult: any = await this.courseRepository.aggregate([
            { $match: courseFilter },
            {
              $project: {
                title: 1,
                expiresOn: 1,
                status: 1,
                imageUrl: 1,
                sections: 1,
                instructors: 1,
                type: 1,
                subjects: 1,
                accessMode: 1,
                summary: 1,
              }
            },
            {
              $lookup: {
                from: "usercourses",
                let: { cid: "$_id" },
                pipeline: [
                  {
                    $match: {
                      userRole: "student",
                      $expr: { $eq: ["$course", "$$cid"] },
                    }
                  },
                  {
                    $project: {
                      user: 1,
                      updatedAt: 1,
                      contents: 1
                    }
                  },
                  {
                    $unwind: "$contents",
                  },
                  {
                    $group: {
                      _id: { course: "$course", user: "$user" },
                      updatedAt: { $first: "$updatedAt" },
                      timeSpent: { $sum: "$contents.timeSpent" }
                    }
                  },
                  {
                    $group: {
                      _id: "$_id.course",
                      updatedAt: { $first: "$updatedAt" },
                      students: { $sum: 1 },
                      timeSpent: { $sum: "$timeSpent" },
                    }
                  }
                ],
                as: "stats",
              }
            },
            { $unwind: "$stats" },
            {
              $facet: {
                courses: [
                  { $sort: { "stats.updatedAt": -1 } },
                  { $skip: skip },
                  { $limit: limit },
                  {
                    $project: {
                      students: "$stats.students",
                      timeSpent: "$stats.timeSpent",
                      updatedAt: "$stats.updatedAt",
                      imageUrl: 1,
                      instructors: 1,
                      title: 1,
                      sections: 1,
                      type: 1,
                      accessMode: 1,
                      subjects: 1,
                    }
                  }
                ],
                count: [
                  {
                    $count: "total"
                  }
                ]
              }
            }
          ]);
          if (ongoingResult[0]) {
            allCourses = ongoingResult[0].courses;
            totalCount = ongoingResult[0].count[0] ? ongoingResult[0].count[0].total : 0;
          }
          break;
      }

      return { courses: allCourses, total: totalCount }
    } catch (err) {
      throw new GrpcInternalException(err.message)
    }
  }

  async getCoursesPublic(request: GetCoursesPublicReq) {
    try {
      const userId = request.userId ? new Types.ObjectId(request.userId) : null
      if (!userId) throw new Error('UserId not passed');

      const page = (request.query.page) ? request.query.page : 1;
      const limit = (request.query.limit) ? request.query.limit : 50;
      const sort = { 'updatedAt': -1 };
      var skip = (page - 1) * limit;
      let ids = []
      let allCourses = [];
      let condition: any = {
        $or: [{ 'user._id': userId }, { 'instructors._id': userId }],
      }

      condition['accessMode'] == 'published'

      var ongoingCond = {}
      ongoingCond["createdBy"] = userId

      condition.status = 'published';

      this.userCourseRepository.setInstanceKey(request.instancekey)
      ids = await this.userCourseRepository.distinct('course', { "createdBy": userId })

      if (ids.length > 0) {
        condition._id = { $nin: ids }
      }

      this.courseRepository.setInstanceKey(request.instancekey)
      allCourses = await this.courseRepository.find(
        condition,
        { title: 1, imageUrl: 1, instructors: 1, sections: 1, type: 1, accessMode: 1, countries: 1, subjects: 1 },
        { sort, limit, skip, lean: true }
      );

      return { result: allCourses };
    } catch (err) {
      throw new GrpcInternalException(err)
    }
  }

  async getTeacherArchivedCourses(request: GetTeacherArchivedCoursesRequest) {
    try {

      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 50;
      let allCourses = [];
      let condition: any = {
        active: true,
        $or: [
          { status: "revoked" },
          { status: "expired" },
          { status: "published", expiresOn: { $lt: new Date() } },
        ],
      };
      if (canOnlySeeLocationContents(request.userRole)) {
        condition.locations = new Types.ObjectId(request.activeLocation)
      }
      if (canOnlySeeHisOwnContents(request.userRole)) {
        condition["user._id"] = new Types.ObjectId(request.userId);
        limit = 30;
      }
      if (request.userRole.includes("publisher")) {
        if (request.activeLocation) {
          this.locationRepository.setInstanceKey(request.instancekey)
          let ownLocation = await this.locationRepository.findOne(
            { _id: new Types.ObjectId(request.activeLocation), user: new Types.ObjectId(request.userId) },
            { user: 1 }
          )
          request.ownLocation = !!ownLocation;
        }
        if (request.ownLocation) {
          condition.$or = [
            {
              locations: new Types.ObjectId(request.activeLocation)
            },
            {
              "user._id": new Types.ObjectId(request.userId)
            }
          ]
        } else {
          condition["user._id"] = new Types.ObjectId(request.userId);
          limit = 30;
        }
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      allCourses = await this.courseRepository.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "usercourses",
            let: { cid: "$_id" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$course", "$$cid"] } },
              },
              { $project: { contents: 1, user: 1, course: 1 } },
              { $unwind: "$contents" },
              {
                $group: {
                  _id: { course: "$course", user: "$user" },
                  timeSpent: { $sum: "$contents.timeSpent" },
                }
              },
              {
                $group: {
                  _id: "$_id.course",
                  student: { $sum: 1 },
                  timeSpent: { $sum: "$timeSpent" },
                },
              },
            ],
            as: "userCourse",
          }
        },
        { $unwind: { path: "$userCourse", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            timeSpent: "$userCourse.timeSpent",
            student: "$userCourse.students",
            expiresOn: 1,
            statusChangedAt: 1,
            updatedAt: 1,
            instructors: 1,
            title: 1,
            type: 1,
            subjects: 1,
            accessMode: 1,
            imageUrl: 1,
          }
        },
        { $sort: { updatedAt: -1 } },
        { $limit: limit },
      ])

      return { response: allCourses }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"
    }
  }

  async getTeacherMostPopularCourses(request: GetTeacherMostPopularCoursesRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 15;
      var skip = (page - 1) * limit;
      let courses = [];
      let condition: any = {
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            },
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: "",
          },
        ],
        status: "published",
        active: true,
      }
      if (request.userRole.includes('publisher')) {
        condition["user._id"] = new Types.ObjectId(request.userId);
      } else {
        condition.locations = new Types.ObjectId(request.activeLocation)
      }
      if (request.userRole.includes('teacher')) {
        condition["user._id"] = { $ne: new Types.ObjectId(request.userId) };
        condition["instructors._id"] = { $ne: new Types.ObjectId(request.userId) }
      }
      if (request.accessMode) {
        condition["accessMode"] = request.accessMode;
      }
      if (request.title) {
        let regexText = this.regexName(request.title);
        condition["title"] = regexText
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      courses = await this.courseRepository.find(condition, {
        title: 1,
        rating: 1,
        totalRatings: 1,
        countries: 1,
        imageUrl: 1,
        instructors: 1,
        sections: 1,
        type: 1,
        subjects: 1,
        accessMode: 1,
        user: 1,
      },
        {
          sort: { rating: -1 },
          limit: limit,
          skip: skip
        },
      )
      for (let course of courses) {
        await this.settings.setPriceByUserCountry(request, course)
      }
      return { courses }

    } catch (err) {
      throw new GrpcInternalException(err.message);
    }
  }

  async getAllTeacherCourses(request: GetAllTeacherCoursesRequest) {
    try {
      var page = request.page ? request.page : 1;
      var limit = request.limit ? request.limit : 50;

      var skip = (page - 1) * limit;
      let condition = {
        locations: new Types.ObjectId(request.user.activeLocation)
      }
      if (canOnlySeeHisOwnContents(request.user.roles)) {
        condition["user._id"] = new Types.ObjectId(request.user._id)
      }
      let expire = {
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            },
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: "",
          }
        ]
      }
      if (request.status) {
        condition["status"] = request.status
      }
      let projection: any = { title: 1, colorCode: 1, imageUrl: 1, totalRatings: 1, rating: 1, level: 1, duration: 1, price: 1, accessMode: 1, subjects: 1, instructors: 1, user: 1, statusChangedAt: 1, type: 1, status: 1, startDate: 1, expiresOn: 1 }

      if (request.home) {
        projection = { title: 1, imageUrl: 1, _id: 1, user: 1, colorCode: 1 };
      }
      this.courseRepository.setInstanceKey(request.instancekey)
      let courses = await this.courseRepository.find(condition, projection, {
        and: expire,
        sort: { updatedAt: -1 },
        limit: limit,
        skip: skip
      })
      return { courses }
    } catch (err) {
      Logger.log(err);
      throw "Internal server error"
    }
  }

  async getPublicListing(request: GetPublicListingRequest) {
    try {
      var limit = Number(request.limit || 4);
      var page = Number(request.page || 1);
      var skip = (page - 1) * limit;
      if (request.skip) {
        skip = Number(request.skip);
      }
      let condition: any = {
        accessMode: { $in: ["public", "buy"] },
        status: "published",
        $and: [
          {
            $or: [
              {
                expiresOn: {
                  $gt: new Date(),
                },
              },
              {
                expiresOn: "",
              }
            ]
          }
        ]
      }

      this.locationRepository.setInstanceKey(request.instancekey)
      let defaultLoc = await this.locationRepository.findOne({
        active: true,
        isDefault: true
      },
        {
          _id: 1
        })
      let locationFilter = {
        $or: [{ locations: [] }]
      };
      if (defaultLoc) {
        locationFilter.$or.push({ locations: defaultLoc._id })
      }
      condition.$and.push(locationFilter);
      let projection = {
        title: 1,
        colorCode: 1,
        imageUrl: 1,
        totalRatings: 1,
        rating: 1,
        level: 1,
        duration: 1,
        countries: 1,
        accessMode: 1,
        subjects: 1,
        instructors: 1,
        user: 1,
        statusChangedAt: 1,
        type: 1,
        status: 1,
        startDate: 1,
        expiresOn: 1,
      };
      this.courseRepository.setInstanceKey(request.instancekey)
      let mCursor = await this.courseRepository.find(condition, projection,
        {
          sort: { rating: -1, totalRatings: -1 },
          skip: skip,
          limit: limit,
        }
      )

      let courses = [];
      let total = 0;
      mCursor.forEach((course) => {
        courses.push(course)
        total++;
      })
      if (request.count) {
        return { courses, total }
      }
      return { courses }
    } catch (err) {
      Logger.log(err)
      throw "Internal Server Error"
    }
  }

  async getBestSellerCourse(request: GetBestSellerCourseRequest) {
    try {
      var page = Number(request.page || 1);
      var limit = Number(request.limit || 20);
      var skip = (page - 1) * limit;
      let condition = {
        accessMode: "buy",
        status: "published",
        locations: new Types.ObjectId(request.activeLocation),
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            }
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: ""
          }
        ]
      };
      let myCourse = [];
      let mostBoughtCourses = [];
      this.userEnrollmentRepository.setInstanceKey(request.instancekey)
      let courseIds = await this.userEnrollmentRepository.aggregate([
        {
          $match: {
            type:
              "course"
          }
        },
        {
          $group: {
            _id: "$item",
            count: { $sum: 1 },
            user: { $first: "$user" },
            updatedAt: { $last: "$updatedAt" },
          }
        },
        { $sort: { count: -1, updatedAt: -1 } },
        { $limit: 50 }
      ])

      if (courseIds.length > 0) {
        courseIds.forEach((d: any) => {
          if (d.user.equals(new Types.ObjectId(request.userId))) {
            myCourse.push(d._id)
          } else {
            mostBoughtCourses.push(d._id);
          }
        });

        if (mostBoughtCourses.length > 0) {
          condition["_id"] = { $in: mostBoughtCourses };
        } else if (myCourse.length > 0) {
          condition["_id"] = { $nin: myCourse };
        }
      }

      if (request.userRole != "student") {
        condition["user._id"] = new Types.ObjectId(request.userId)
        this.courseRepository.setInstanceKey(request.instancekey)
        let courses = await this.courseRepository.aggregate([
          { $match: condition },
          {
            $lookup: {
              from: "usercourses",
              let: { cid: "$_id" },
              pipeline: [
                {
                  $match: { $expr: { $eq: ["$course", "$$cid"] } },
                },
                { $project: { contents: 1, user: 1, course: 1 } },
                { $unwind: "$contents" },
                {
                  $group: {
                    _id: "$_id.course",
                    students: { $sum: 1 },
                    timeSpent: { $sum: "$timeSpent" },
                  },
                },
              ],
              as: "userCourse",
            }
          },
          { $unwind: "$userCourse" },
          {
            $project: {
              timeSpent: "$userCourse.timeSpent",
              students: "$userCourse.students",
              colorCode: 1,
              imageUrl: 1,
              updatedAt: 1,
              instructors: 1,
              title: 1,
              countries: 1,
              user: 1,
              type: 1,
              subjects: 1,
              accessMode: 1,
            }
          },
          { $sort: { updatedAt: -1 } },
          { $limit: limit }
        ])

        for (let course of courses) {
          await this.settings.setPriceByUserCountry(request, course)
        }

        return { courses }
      } else {
        let projection = {
          title: 1,
          colorCode: 1,
          imageUrl: 1,
          totalRatings: 1,
          rating: 1,
          level: 1,
          duration: 1,
          countries: 1,
          accessMode: 1,
          subjects: 1,
          instructors: 1,
          user: 1,
          statusChangedAt: 1,
          type: 1,
          status: 1,
          startDate: 1,
          expiresOn: 1,
        }
        this.courseRepository.setInstanceKey(request.instancekey)
        let courses = await this.courseRepository.find(
          condition,
          projection,
          {
            sort: { updatedAt: -1 },
            limit: limit,
            skip: skip,
          }
        )
        for (let course of courses) {
          await this.settings.setPriceByUserCountry(request, course)
        }
        return { courses }
      }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }

  /*
   !Todo: SetPriceByCountry
 */
  async getPopularCourse(request: GetPopularCourseRequest) {
    try {
      var page = Number(request.page || 1);
      var limit = Number(request.limit || 2);
      var skip = (page - 1) * limit;
      let condition: any = {
        accessMode: "buy",
        status: "published",
        locations: new Types.ObjectId(request.activeLocation),
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            },
          },
          {
            expiresOn: null,
          },
          {
            expiresOn: "",
          },
        ],
      };
      this.userEnrollmentRepository.setInstanceKey(request.instancekey)
      let enrolledCourses = await this.userEnrollmentRepository.distinct("item", {
        user: new Types.ObjectId(request.userId),
        type: "course",
        location: request.userLocation,
        $or: [
          {
            expiresOn: {
              $gt: new Date(),
            }
          },
          {
            expiresOn: null
          }
        ]
      })
      condition.origin = "publisher";
      condition._id = { $nin: enrolledCourses };
      let courses = await this.courseRepository.find(
        condition,
        {
          title: 1,
          countries: 1,
          subjects: 1,
          user: 1,
          colorCode: 1,
          summary: 1,
          imageUrl: 1,
          offeredBy: 1,
          ratings: 1,
          totalRatings: 1,
          duration: 1,
          sections: 1,
        },
        {
          sort: { rating: -1 },
          limit: limit,
          skip: skip
        }
      )
      for (let course of courses) {
        await this.settings.setPriceByUserCountry(request, course)
      }
      return { courses }
    } catch (err) {
      Logger.log(err)
      throw new InternalServerErrorException ("internal Server Error")
    }
  }
  async getArchiveCourses(request: GetArchiveCoursesRequest) {

    var page = request.page ? request.page : 1;
    var limit = request.limit ? request.limit : 50;
    var skip = (page - 1) * limit;

    this.userCourseRepository.setInstanceKey(request.instancekey)
    let courseIds = await this.userCourseRepository.distinct("course", {
      user: new Types.ObjectId(request.userId),
      completed: true
    })
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      let result = await this.courseRepository.find(
        { _id: { $in: courseIds }, locations: new Types.ObjectId(request.activeLocation) },
        {
          title: 1, subjects: 1, imageUrl: 1, colorCode: 1
        },
        {
          sort: { updatedAt: -1 },
          limit: limit,
          skip: skip
        }
      )
      return { result }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getQuestionDistributionAnalytics(request: GetQuestionDistributionAnalyticsRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)
      let dis = await this.attemptRepository.aggregate([
        {
          $match: {
            isAbandoned: false,

            referenceId: new Types.ObjectId(request.referenceId),
            referenceType: "course"
          }
        },
        {
          $lookup: {
            from: "attemptdetails",
            localField: "_id",
            foreignField: "attempt",
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
        { $unwind: "$QA" },
        {
          $group: {
            _id: { categoru: "$QA.category", status: "$QA.status" },
            count: { $sum: 1 },
          }
        },
        {
          $group: {
            _id: "$_id.category",
            distribution: {
              $push: {
                status: "$_id.status",
                count: "$count"
              }
            }
          }
        }
      ])

      return { dis }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"
    }
  }
  async getRankingAnalytics(request: GetRankingAnalyticsRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)

      this.attemptRepository.setInstanceKey(request.instancekey)
      let ranking: any = await this.attemptRepository.aggregate([
        {
          $match: {
            isAbandoned: false,
            createdAt: { $gte: new Date(request.createdAt) },
            referenceId: new Types.ObjectId(request.referenceId),
            referenceType: "course",
          },
        },
        {
          $unwind: "$subjects",
        },
        {
          $group: {
            _id: "$user",
            score: { $sum: "$subjects.mark" },
            speed: { $avg: "$subjects.speed" },
          },
        },
        {
          $sort: {
            score: -1,
            speed: 1,
          },
        },
        {
          $facet: {
            top: [
              { $limit: 8 },
              {
                $lookup: {
                  from: "users",
                  let: { uid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$uid"] },
                      },
                    },
                    {
                      $project: {
                        name: 1,
                        userId: 1,
                        "avatar.fileUrl": 1,
                        provider: 1,
                        "google.imageUrl": 1,
                        "facebook.avatar": 1,
                      },
                    },
                  ],
                  as: "userInfo",
                },
              },
              {
                $unwind: "$userInfo",
              },
              {
                $project: {
                  _id: "$userInfo._id",
                  studentName: "$userInfo.name",
                  userId: "$userInfo.userId",
                  score: 1,
                  speed: 1,
                  provider: "$userInfo.provider",
                  "avatar.fileUrl": "$userInfo.avatar.fileUrl",
                  "google.imageUrl": "$userInfo.google.imageUrl",
                  "facebook.avatar": "$userInfo.facebook.avatar",
                },
              },
            ],
            student: [
              {
                $group: {
                  _id: null,
                  all: {
                    $push: {
                      _id: "$_id",
                      studentName: "$studentName",
                      userId: "$userId",
                      score: "$score",
                      speed: "$speed",
                    },
                  },
                },
              },
              {
                $addFields: {
                  ranking: {
                    $indexOfArray: ["$all._id", new Types.ObjectId(request.userId)],
                  },
                },
              },
              { $unwind: "$all" },
              { $match: { "all._id": new Types.ObjectId(request.userId) } },
              {
                $lookup: {
                  from: "users",
                  let: { uid: "$all._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$uid"] },
                      },
                    },
                    {
                      $project: {
                        name: 1,
                        userId: 1,
                        "avatar.fileUrl": 1,
                        provider: 1,
                        "google.imageUrl": 1,
                        "facebook.avatar": 1,
                      },
                    },
                  ],
                  as: "userInfo",
                },
              },
              {
                $unwind: "$userInfo",
              },
              {
                $project: {
                  _id: "$userInfo._id",
                  studentName: "$userInfo.name",
                  userId: "$userInfo.userId",
                  score: "$all.score",
                  speed: "$all.speed",
                  provider: "$userInfo.provider",
                  "avatar.fileUrl": "$userInfo.avatar.fileUrl",
                  "google.imageUrl": "$userInfo.google.imageUrl",
                  "facebook.avatar": "$userInfo.facebook.avatar",
                },
              },
            ],
          },
        },
      ])

      return {
        top: ranking[0] ? ranking[0].top : [],
        student: ranking[0] && ranking[0].student[0] ? ranking[0].student : [],
      }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getCourseContentAttemptByStudent(request) {
    try {
      let condition = {};
      condition["user"] = new Types.ObjectId(request.userId);
      condition["practicesetId"] = new Types.ObjectId(request.practiceSetId)
      let res = await this.findOneAttempt(request, condition, [["updatedAt", -1]])
      return { response: res }
    } catch (err) {
      Logger.log(err);
      throw new InternalServerErrorException ("Internal Server error")
    }
  }
  async getPracticeTimeAnalytics(request: GetPracticeTimeAnalyticsRequest) {
    try {
      this.userCourseRepository.setInstanceKey(request.instancekey)
      let analysis: any = await this.userCourseRepository.aggregate([
        {
          $match: {
            course: new Types.ObjectId(request.courseId),
            createdAt: { $gte: new Date(request.createdAt) }
          }
        },
        { $unwind: "$contents" },
        { $match: { "contents.type": { $in: ["quiz", "assessment"] } } },
        {
          $group: {
            _id: "$user",
            timeSpent: { $sum: "$contents.timeSpent" }
          }
        },
        {
          $facet: {
            top: [
              {
                $sort: { timeSpent: -1 },
              },
              {
                $limit: 1,
              }
            ],
            average: [
              {
                $group: {
                  _id: null,
                  timeSpent: { $avg: "$timeSpent" },
                }
              }
            ],
            student: [
              {
                $match: { _id: new Types.ObjectId(request.userId) }
              }
            ]
          }
        }
      ]);
      let data: any = {
        top: analysis[0] && analysis[0].top[0] ? analysis[0].top[0].timeSpent : 0,
        average:
          analysis[0] && analysis[0].average[0] ? analysis[0].average[0].timeSpent : 0,
        student: analysis[0] && analysis[0].student[0] ? analysis[0].student[0].timeSpent : 0,
      };
      if (request.lastDays) {
        let lastDaysAnalytics1: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) }
            }
          },
          {
            $unwind: "$contents"
          },
          {
            $match: {
              "contents.type": { $in: ["quiz", "assessment"] },
              "contents.start": {
                $gte: timeHelper.lastDays(
                  request.lastDays,
                  request.timezoneOffset
                )
              }
            }
          },
          {
            $group: {
              _id: "$user",
              timeSpent: { $sum: "$contents.timeSpent" },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { timeSpent: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    timeSpent: { $avg: "$timeSpent" },
                  }
                }
              ],
              student: [
                {
                  $match: { _id: new Types.ObjectId(request.userId) }
                }
              ]
            }
          }
        ]);
        let lastDaysAnalytics2: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) }
            }
          },
          {
            $unwind: "$contents"
          },
          {
            $match: {
              "contents.type": { $in: ["quiz", "assessment"] },
              $and: [
                {
                  "contents.start": {
                    $gte: timeHelper.lastDays(
                      request.lastDays * 2,
                      request.timezoneOffset
                    ),
                  },
                },
                {
                  "contents.start": {
                    $lte: timeHelper.lastDaysEnd(
                      request.lastDays + 1,
                      request.timezoneOffset
                    )
                  }
                },
              ]
            },
          },
          {
            $group: {
              _id: "$user",
              timeSpent: { $sum: "$contents.timeSpent" },
            }
          },
          {
            $facet: {
              top: [
                {
                  $sort: { timeSpent: -1 },
                },
                {
                  $limit: 1,
                }
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    timeSpent: { $avg: "$timeSpent" },
                  }
                }
              ],
              student: [
                {
                  $match: { _id: request.userId }
                }
              ]
            }
          }
        ]);
        let lastDaysData = {
          top:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].top[0]
              ? lastDaysAnalytics1[0].top[0].timeSpent
              : 0,
          average:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].average[0]
              ? lastDaysAnalytics1[0].average[0].timeSpent
              : 0,
          student:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].student[0]
              ? lastDaysAnalytics1[0].student[0].timeSpent
              : 0,
        }
        if (lastDaysAnalytics2[0]) {
          if (lastDaysAnalytics2[0].top[0]) {
            lastDaysData.top =
              lastDaysData.top - lastDaysAnalytics2[0].top[0].timeSpent;
          }

          if (lastDaysAnalytics2[0].average[0]) {
            lastDaysData.average =
              lastDaysData.average - lastDaysAnalytics2[0].average[0].timeSpent;
          }

          if (lastDaysAnalytics2[0].student[0]) {
            lastDaysData.student =
              lastDaysData.student - lastDaysAnalytics2[0].student[0].timeSpent;
          }
        }

        data.lastDaysData = lastDaysData
      }
      return { top: data.top, average: data.average, student: data.student, lastDaysData: data.lastDaysData }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getLearningTimeAnalytics(request: GetLearningTimeAnalyticsRequest) {
    try {
      await this.userCourseRepository.setInstanceKey(request.instancekey)
      let analysis: any = await this.userCourseRepository.aggregate([
        {
          $match: {
            course: new Types.ObjectId(request.courseId),
            createdAt: { $gte: new Date(request.createdAt) }
          }
        },
        { $unwind: "$contents" },
        {
          $match: {
            "contents.type": { $in: ["video", "ebook", "note", "onlineSession"] }
          }
        },
        {
          $group: {
            _id: "$user",
            timeSpent: { $sum: "$contents.timeSpent" }
          }
        },
        {
          $facet: {
            top: [
              {
                $sort: { timeSpent: -1 },
              },
              {
                $limit: 1,
              }
            ],
            average: [
              {
                $group: {
                  _id: null,
                  timeSpent: { $avg: "$timeSpent" },
                },
              },
            ],
            student: [
              {
                $match: { _id: new Types.ObjectId(request.userId) }
              }
            ]
          }
        }
      ])
      let data: any = {
        top: analysis[0] && analysis[0].top[0] ? analysis[0].top[0].timeSpent : 0,
        average: analysis[0] && analysis[0].average[0] ? analysis[0].average[0].timeSpent : 0,
        student: analysis[0] && analysis[0].student[0] ? analysis[0].student[0].timeSpent : 0,
      };
      if (request.lastDays) {
        let lastDaysAnalytics1: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) },
            },
          },
          { $unwind: "$contents" },
          {
            $match: {
              "contents.type": {
                $in: ["video", "ebook", "note", "onlineSession"],
              },
              "contents.start": {
                $gte: timeHelper.lastDays(
                  request.lastDays,
                  request.timezoneOffset
                ),
              }
            }
          },
          {
            $group: {
              _id: "$user",
              timeSpent: { $sum: "$contents.timeSpent" },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { timeSpent: -1 },
                },
                {
                  $limit: 1,
                }
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    timeSpent: { $avg: "$timeSpent" },
                  }
                }
              ],
              student: [
                { $match: { _id: new Types.ObjectId(request.userId) } },
              ]
            }
          }
        ]);
        let lastDaysAnalytics2: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) }
            }
          },
          { $unwind: "$contents" },
          {
            $match: {
              "contents.type": {
                $in: ["video", "ebook", "note", "onlineSession"],
              },
              $and: [
                {
                  "contents.start": {
                    $gte: timeHelper.lastDays(
                      request.lastDays * 2,
                      request.timezoneOffset
                    )
                  }
                },
                {
                  "contents.start": {
                    $lte: timeHelper.lastDaysEnd(
                      request.lastDays + 1,
                      request.timezoneOffset
                    )
                  }
                }
              ]
            }
          },
          {
            $group: {
              _id: "$user",
              timeSpent: { $sum: "$contents.timeSpent" }
            }
          },
          {
            $facet: {
              top: [
                {
                  $sort: { timeStamp: -1 },
                },
                {
                  $limit: 1,
                }
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    timeSpent: { $avg: "$timeSpent" },
                  }
                }
              ],
              student: [
                {
                  $match: { _id: new Types.ObjectId(request.userId) }
                }
              ]
            }
          }
        ]);
        let lastDaysData = {
          top:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].top[0]
              ? lastDaysAnalytics1[0].top[0].timeSpent
              : 0,
          average:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].average[0]
              ? lastDaysAnalytics1[0].average[0].timeSpent
              : 0,
          student:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].student[0]
              ? lastDaysAnalytics1[0].student[0].timeSpent
              : 0,
        };

        if (lastDaysAnalytics2[0]) {
          if (lastDaysAnalytics2[0].top[0]) {
            lastDaysData.top =
              lastDaysData.top - lastDaysAnalytics2[0].top[0].timeSpent;
          }

          if (lastDaysAnalytics2[0].average[0]) {
            lastDaysData.average =
              lastDaysData.average - lastDaysAnalytics2[0].average[0].timeSpent;
          }

          if (lastDaysAnalytics2[0].student[0]) {
            lastDaysData.student =
              lastDaysData.student - lastDaysAnalytics2[0].student[0].timeSpent;
          }
        }
        data.lastDaysData = lastDaysData
      }
      return { top: data.top, average: data.average, student: data.student, lastDaysData: data.lastDaysData }

    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getCompletionAnalytics(request: GetCompletionAnalyticsRequest) {
    try {
      let analysis: any = await this.userCourseRepository.aggregate([
        {
          $match: {
            course: new Types.ObjectId(request.courseId),
            createdAt: { $gte: new Date(request.createdAt) },
          },
        },
        { $unwind: "$contents" },
        { $match: { "contents.completed": true } },
        {
          $group: {
            _id: "$_id",
            course: { $first: "$course" },
            user: { $first: "$user" },
            updatedAt: { $first: "$updatedAt" },
            doContents: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "courses",
            let: { cid: "$course" },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$cid"] } },
              },
              { $project: { title: 1, sections: 1 } },
            ],
            as: "courseInfo",
          },
        },
        { $unwind: "$courseInfo" },
        { $unwind: "$courseInfo.sections" },
        {
          $project: {
            _id: 1,
            user: 1,
            course: 1,
            updatedAt: 1,
            title: "$courseInfo.title",
            doContents: 1,
            contentCount: { $size: "$courseInfo.sections.contents" },
          },
        },
        {
          $group: {
            _id: "$_id",
            user: { $first: "$user" },
            course: { $first: "$course" },
            updatedAt: { $first: "$updatedAt" },
            title: { $first: "$title" },
            doContents: { $first: "$doContents" },
            totalContents: { $sum: "$contentCount" },
          },
        },
        {
          $project: {
            _id: 1,
            user: 1,
            course: 1,
            updatedAt: 1,
            title: 1,
            doContents: 1,
            totalContents: 1,
          },
        },
        {
          $facet: {
            top: [
              {
                $sort: { doContents: -1 },
              },
              {
                $limit: 1,
              },
            ],
            average: [
              {
                $group: {
                  _id: null,
                  doContents: { $avg: "$doContents" },
                },
              },
            ],
            student: [
              {
                $match: { user: new Types.ObjectId(request.userId) },
              },
            ],
          },
        },
      ]);

      let data: any = {
        top:
          analysis[0] && analysis[0].top[0] ? analysis[0].top[0].doContents : 0,
        average:
          analysis[0] && analysis[0].average[0]
            ? analysis[0].average[0].doContents
            : 0,
        student:
          analysis[0] && analysis[0].student[0]
            ? analysis[0].student[0].doContents
            : 0,
        totalContents:
          analysis[0] && analysis[0].student[0]
            ? analysis[0].student[0].totalContents
            : 0,
      };

      if (request.lastDays) {
        // get last days analytics
        // compare 2 day range (2xlastDays - lastDays)
        let lastDaysAnalytics1: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) },
            },
          },
          { $unwind: "$contents" },
          {
            $match: {
              "contents.completed": true,
              "contents.end": {
                $gte: timeHelper.lastDays(
                  request.lastDays,
                  request.timezoneOffset
                ),
              },
            },
          },
          {
            $group: {
              _id: "$_id",
              user: { $first: "$user" },
              doContents: { $sum: 1 },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { doContents: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    doContents: { $avg: "$doContents" },
                  },
                },
              ],
              student: [
                {
                  $match: { user: new Types.ObjectId(request.userId) },
                },
              ],
            },
          },
        ]);

        let lastDaysAnalytics2: any = await this.userCourseRepository.aggregate([
          {
            $match: {
              course: new Types.ObjectId(request.courseId),
              createdAt: { $gte: new Date(request.createdAt) },
            },
          },
          { $unwind: "$contents" },
          {
            $match: {
              "contents.completed": true,
              $and: [
                {
                  "contents.end": {
                    $gte: timeHelper.lastDays(
                      request.lastDays * 2,
                      request.timezoneOffset
                    ),
                  },
                },
                {
                  "contents.end": {
                    $lte: timeHelper.lastDaysEnd(
                      request.lastDays + 1,
                      request.timezoneOffset
                    ),
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: "$_id",
              user: { $first: "$user" },
              doContents: { $sum: 1 },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { doContents: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    doContents: { $avg: "$doContents" },
                  },
                },
              ],
              student: [
                {
                  $match: { user: new Types.ObjectId(request.userId) },
                },
              ],
            },
          },
        ]);

        let lastDaysData: any = {
          top:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].top[0]
              ? lastDaysAnalytics1[0].top[0].doContents
              : 0,
          average:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].average[0]
              ? lastDaysAnalytics1[0].average[0].doContents
              : 0,
          student:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].student[0]
              ? lastDaysAnalytics1[0].student[0].doContents
              : 0,
        };

        if (lastDaysAnalytics2[0]) {
          if (lastDaysAnalytics2[0].top[0]) {
            lastDaysData.top =
              lastDaysData.top - lastDaysAnalytics2[0].top[0].doContents;
          }

          if (lastDaysAnalytics2[0].average[0]) {
            lastDaysData.average =
              lastDaysData.average - lastDaysAnalytics2[0].average[0].doContents;
          }

          if (lastDaysAnalytics2[0].student[0]) {
            lastDaysData.student =
              lastDaysData.student - lastDaysAnalytics2[0].student[0].doContents;
          }
        }

        data.lastDaysData = lastDaysData;
      }

      return { top: data.top, average: data.average, student: data.student, lastDaysData: data.lastDaysData }
    } catch (err) {
      Logger.log(err);
      throw "Internal server error"
    }
  }
  async getAccuracyAnalytics(request: GetAccuracyAnalyticsRequest) {
    try {
      this.attemptRepository.setInstanceKey(request.instancekey)

      let analysis: any = await this.attemptRepository.aggregate([
        {
          $match: {
            isAbandoned: false,
            createdAt: { $gte: new Date(request.createdAt) },
            referenceType: "course",
            referenceId: new Types.ObjectId(request.referenceId),
            location: new Types.ObjectId(request.activeLocation),
          },
        },
        {
          $group: {
            _id: "$user",
            maximumMarks: { $sum: "$maximumMarks" },
            totalMark: { $sum: "$totalMark" },
          },
        },
        {
          $project: {
            _id: 1,
            accuracy: {
              $cond: [
                { $eq: ["$maximumMarks", 0] },
                0,
                { $divide: ["$totalMark", "$maximumMarks"] },
              ],
            },
          },
        },
        {
          $facet: {
            top: [
              {
                $sort: { accuracy: -1 },
              },
              {
                $limit: 1,
              },
            ],
            average: [
              {
                $group: {
                  _id: null,
                  accuracy: { $avg: "$accuracy" },
                },
              },
            ],
            student: [
              {
                $match: { _id: new Types.ObjectId(request.userId) },
              },
            ],
          },
        },
      ]);

      let data: any = {
        top: analysis[0] && analysis[0].top[0] ? analysis[0].top[0].accuracy : 0,
        average:
          analysis[0] && analysis[0].average[0]
            ? analysis[0].average[0].accuracy
            : 0,
        student:
          analysis[0] && analysis[0].student[0]
            ? analysis[0].student[0].accuracy
            : 0,
      };

      if (request.lastDays) {
        // get last days analytics
        let lastDaysAnalytics1: any = await this.attemptRepository.aggregate([
          {
            $match: {
              isAbandoned: false,
              createdAt: {
                $gte: timeHelper.lastDays(
                  request.lastDays,
                  request.timezoneOffset
                ),
              },
              referenceType: "course",
              referenceId: new Types.ObjectId(request.referenceId),
            },
          },
          {
            $group: {
              _id: "$user",
              maximumMarks: { $sum: "$maximumMarks" },
              totalMark: { $sum: "$totalMark" },
            },
          },
          {
            $project: {
              _id: 1,
              accuracy: {
                $cond: [
                  { $eq: ["$maximumMarks", 0] },
                  0,
                  { $divide: ["$totalMark", "$maximumMarks"] },
                ],
              },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { accuracy: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    accuracy: { $avg: "$accuracy" },
                  },
                },
              ],
              student: [
                {
                  $match: { _id: new Types.ObjectId(request.userId) },
                },
              ],
            },
          },
        ]);

        let lastDaysAnalytics2: any = await this.attemptRepository.aggregate([
          {
            $match: {
              isAbandoned: false,
              referenceType: "course",
              referenceId: new Types.ObjectId(request.referenceId),
              $and: [
                {
                  createdAt: {
                    $gte: timeHelper.lastDays(
                      request.lastDays * 2,
                      request.timezoneOffset
                    ),
                  },
                },
                {
                  createdAt: {
                    $lte: timeHelper.lastDaysEnd(
                      request.lastDays + 1,
                      request.timezoneOffset
                    ),
                  },
                },
              ],
            },
          },
          {
            $group: {
              _id: "$user",
              maximumMarks: { $sum: "$maximumMarks" },
              totalMark: { $sum: "$totalMark" },
            },
          },
          {
            $project: {
              _id: 1,
              accuracy: {
                $cond: [
                  { $eq: ["$maximumMarks", 0] },
                  0,
                  { $divide: ["$totalMark", "$maximumMarks"] },
                ],
              },
            },
          },
          {
            $facet: {
              top: [
                {
                  $sort: { accuracy: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              average: [
                {
                  $group: {
                    _id: null,
                    accuracy: { $avg: "$accuracy" },
                  },
                },
              ],
              student: [
                {
                  $match: { _id: new Types.ObjectId(request.userId) },
                },
              ],
            },
          },
        ]);

        let lastDaysData = {
          top:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].top[0]
              ? lastDaysAnalytics1[0].top[0].accuracy
              : 0,
          average:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].average[0]
              ? lastDaysAnalytics1[0].average[0].accuracy
              : 0,
          student:
            lastDaysAnalytics1[0] && lastDaysAnalytics1[0].student[0]
              ? lastDaysAnalytics1[0].student[0].accuracy
              : 0,
        };

        if (lastDaysAnalytics2[0]) {
          if (lastDaysAnalytics2[0].top[0]) {
            lastDaysData.top =
              lastDaysData.top - lastDaysAnalytics2[0].top[0].accuracy;
          }

          if (lastDaysAnalytics2[0].average[0]) {
            lastDaysData.average =
              lastDaysData.average - lastDaysAnalytics2[0].average[0].accuracy;
          }

          if (lastDaysAnalytics2[0].student[0]) {
            lastDaysData.student =
              lastDaysData.student - lastDaysAnalytics2[0].student[0].accuracy;
          }
        }
        data.lastDaysData = lastDaysData;
      }


      return { top: data.top, average: data.average, student: data.student, lastDaysData: data.lastDaysData }

    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"
    }
  }

  async getMyFavorite(request: GetMyFavoriteRequest) {
    try {
      var page = Number(request.page || 1);
      var limit = Number(request.limit || 20);
      var skip = (page - 1) * limit;
      var sort = { updatedAt: -1 };
      let condition: any = {};
      let courses = [];
      let courseCount = 0;

      if (request.name) {
        var regexText = this.regexName(request.name);
        condition.title = regexText
      }
      if (request.subject) {
        condition["subjects._id"] = new Types.ObjectId(request.subject)
      }
      if (request.course) {
        condition["course._id"] = new Types.ObjectId(request.course)
      }
      condition.user = new Types.ObjectId(request.userId)
      condition.type = "content";
      condition.location = new Types.ObjectId(request.activeLocation);
      if (request.includeCourse) {
        let filter: any = {
          type: "course",
          user: new Types.ObjectId(request.userId),
          location: new Types.ObjectId(request.activeLocation)
        };
        if (request.subject) {
          filter["subjects._id"] = new Types.ObjectId(request.subject)
        }
        this.favoriteRepository.setInstanceKey(request.instancekey)
        courseCount = await this.favoriteRepository.countDocuments(filter);

        courses = await this.favoriteRepository.aggregate([
          {
            $match: filter,
          },
          {
            $sort: sort
          },
          {
            $project: {
              _id: 1,
              type: 1,
              title: 1,
              itemId: 1,
              updatedAt: 1,
            }
          },
          {
            $lookup: {
              from: "courses",
              localField: "itemId",
              foreignField: "_id",
              as: 'crs'
            }
          },
          { $unwind: "$crs" },
          { $match: { "crs.status": { $ne: "revoked" } } },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 1,
              type: 1,
              title: 1,
              course: 1,
              itemId: 1,
              imageUrl: 1,
            }
          }
        ]);
      }
      if (request.count) {
        let favoritesCount = await this.favoriteRepository.countDocuments(condition)
        let totalCount = favoritesCount + courseCount;
        return { totalCount };

      } else {
        let fav = await this.favoriteRepository.aggregate([
          {
            $match: condition,
          },
          { $sort: sort },
          {
            $project: {
              _id: 1,
              type: 1,
              title: 1,
              course: 1,
              itemId: 1,
              updatedAt: 1
            }
          },
          {
            $lookup: {
              from: "courses",
              localField: "course._id",
              foreignField: "_id",
              as: "crs"
            }
          },
          { $unwind: "$crs" },
          { $match: { "crs.status": { $ne: "revoked" } } },
          {
            $project: {
              _id: 1,
              type: 1,
              title: 1,
              course: 1,
              itemId: 1,
              sections: "$crs.sections",
            },
          },
          { $unwind: "$sections" },
          { $unwind: "$sections.contents" },
          {
            $project: {
              _id: 1,
              type: 1,
              title: 1,
              course: 1,
              itemId: 1,
              content: "$sections.contents._id",
              contentType: "$sections.contents.type",
            },
          },
          {
            $match: {
              $expr: { $eq: ["$content", "$itemId"] },
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          }
        ])
        let total = courses.concat(fav)

        return { response: total }
      }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async getFavoriteSubjects(request: GetFavoriteSubjectsRequest) {
    try {
      this.favoriteRepository.setInstanceKey(request.instancekey)
      let subjects = await this.favoriteRepository.distinct("subjects", {
        user: new Types.ObjectId(request.userId),
        type: "content",
        location: new Types.ObjectId(request.activeLocation)
      })
      return { response: subjects }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server error"
    }
  }
  /*
     !Todo: SetPriceByCountry
   */
  async count(request: CountRequest) {
    try {
      console.log(request);
      
      let condition: any = { active: true };
      if (request.userRole.includes("publisher")) {
        if (request.activeLocation) {
          this.locationRepository.setInstanceKey(request.instancekey)
          let ownLocation = await this.locationRepository.findOne(
            {
              _id: new Types.ObjectId(request.activeLocation), user: new Types.ObjectId(request.userId)
            },
            { user: 1 }
          )
          if (ownLocation) {
            condition.$and = [
              {
                $or: [
                  {
                    locations: new Types.ObjectId(request.activeLocation)
                  },
                  {
                    "user._id": new Types.ObjectId(request.userId)
                  }
                ]
              }
            ];
          } else {
            condition["user._id"] = new Types.ObjectId(request.userId)
          }
        } else {
          condition["user._id"] = new Types.ObjectId(request.userId)
        }
      } else {
        condition.locations = new Types.ObjectId(request.activeLocation)
      }
      let withdrawnCount = 0;
      if (request.userRole.includes("student")) {
        if (request.accessMode == "buy") {
          condition.accessMode = "buy";
        } else {
          condition = await this.baseFilter(request)
        }
        condition.status = "published";
        if (request.keywords) {
          let regexText = this.regexName(request.keywords);
          condition.title = regexText;
          let withdrawCondition = { ...condition, status: "revoked" };
          this.courseRepository.setInstanceKey(request.instancekey)
          const withdrawnCourses = await this.courseRepository.find(withdrawCondition, { _id: 1 });

          for (let course of withdrawnCourses) {
            this.userEnrollmentRepository.setInstanceKey(request.instancekey)
            let enrolled = await this.userEnrollmentRepository.findOne({ item: course._id, user: new Types.ObjectId(request.userId) }, { _id: 1 })
            course.enrolled == !!enrolled;
            await this.settings.setPriceByUserCountry(request, course)
          }
          let withdrawnEnrolled = withdrawnCourses.filter(e => e.enrolled);
          withdrawnCount = withdrawnEnrolled.length;
        }
      } else {
        if (canOnlySeeHisOwnContents(request.userRole)) {
          condition["user._id"] = new Types.ObjectId(request.userId);
        }
        if (request.keywords) {
          let regexText = this.regexName(request.keywords);
          condition.$or = [{ title: regexText }, { status: request.keywords }]
        }
      }
      if (request.subject) {
        condition["subjects._id"] = new Types.ObjectId(request.subject);
      }
      if (request.level) {
        condition.level = request.level
      }
      if (request.accessMode) {
        condition.accessMode = request.accessMode;
      }
      if (request.price) {
        let pRange = request.price.split("-");
        if (pRange.length > 1) {
          condition.price = {
            $gte: pRange[0],
            $lte: pRange[1],
          }
        } else {
          if (request.price.indexOf(">") === -1) {
            condition.price = { $lte: pRange[0] };
          } else {
            pRange[0] = request.price.replace(">", "");
            condition.practice = { $gte: pRange[0] };
          }
        }
      }
      if (request.duration) {
        let pDuration = request.duration.split("-");
        if (pDuration.length > 1) {
          condition.duration = {
            $gte: pDuration[0],
            $lte: pDuration[1],
          };
        } else {
          condition.duration = { $lte: pDuration[0] };
        }
      }
      if (request.author) {
        condition["user._id"] = request.author;
      }
      console.log(JSON.stringify(condition))
      let pipeline: any = [{ $match: condition }];
      if (request.userRole.includes("director")) {
        pipeline.push(
          {
            $lookup: {
              from: "users",
              localField: "user._id",
              foreignField: "_id",
              as: "userInfo",
            }
          },
          { $unwind: "$userInfo" },
          {
            $match: {
              $expr: {
                $cond: [
                  { $eq: ["$userInfo.role", "publisher"] },
                  { $ne: ["$status", "draft"] },
                  {},
                ],
              },
            },
          }
        )
      }
      pipeline.push({ $count: "total" });
      this.courseRepository.setInstanceKey(request.instancekey)
      let courses: any = await this.courseRepository.aggregate(pipeline)

      return { total: courses[0] ? courses[0].total : 0 + withdrawnCount }
    } catch (err) {
      Logger.log(err);
      throw "Internal Server Error"
    }
  }
  async notifyStudentsAfterWithdrawal(request: NotifyStudentsAfterWithdrawalRequest) {
    try {
      this.courseRepository.setInstanceKey(request.instancekey)
      var course = await this.courseRepository.findOne({ _id: new Types.ObjectId(request.courseId) }, { _id: 1 })
      if (!course) {
        throw new NotFoundException('Course Not Found')
      }
      await this.courseRepository.updateOne
        ({ _id: new Types.ObjectId(request.courseId) },
          {
            $set: {
              statusChangeAt: new Date(),
              status: "revoked"
            }
          })
      var enrolledUsers = await this.getEnrolledCourseIds(request, request.courseId);
      await this.withdrawalEmail(request, course.title, enrolledUsers, request.notificationMsg)
      return { msg: "email sent" }
    } catch (error) {
      if (error instanceof (NotFoundException)) {
        throw new GrpcNotFoundException(error.message);
      }
      throw new GrpcInternalException(error.message);
    }
  }
  /*
     !Todo: SetPriceByCountry
   */
  async find(request: FindRequest) {
    console.log(request);

    var page = Number(request.page || 1);
    var limit = Number(request.limit || 20);
    var skip = (page - 1) * limit;
    let withdrawnEnrolled = [];
    let courses = [];
    let projection = {
      title: 1,
      colorCode: 1,
      imageurl: 1,
      totalRatings: 1,
      rating: 1,
      level: 1,
      duration: 1,
      countries: 1,
      accessMode: 1,
      subjects: 1,
      instructors: 1,
      user: 1,
      statusChangedAt: 1,
      type: 1,
      status: 1,
      startDate: 1,
      expiresOn: 1,
      classrooms: 1,
      locations: 1,
    }

    let condition: any = { active: true };
    if (request.userRole.includes("publisher")) {
      if (request.activeLocation) {
        this.locationRepository.setInstanceKey(request.instancekey)
        let ownLocation = await this.locationRepository.findOne(
          {
            _id: new Types.ObjectId(request.activeLocation), user: new Types.ObjectId(request.userId)

          }
        )
        if (ownLocation) {
          condition.$and = [
            {
              $or: [
                {
                  locations: new Types.ObjectId(request.activeLocation)
                },
                {
                  "user._id": new Types.ObjectId(request.userId)
                }
              ]
            }
          ]
        } else {
          condition["user._id"] = new Types.ObjectId(request.userId)
        }
      } else {
        condition["user._id"] = new Types.ObjectId(request.userId)
      }
    } else {
      condition.locations = new Types.ObjectId(request.activeLocation)
    }

    if (request.userRole.includes("student")) {
      if (request.accessMode == "buy") {
        condition.accessMode = "buy"
      } else {
        condition = await this.baseFilter(request);
      }
      condition.status = "published";

      if (request.keywords) {
        let regexText = regex(request.keywords);
        condition.title = regexText;
        let withdrawCondition = { ...condition, status: "revoked" };
        this.courseRepository.setInstanceKey(request.instancekey)
        const withdrawnCourses = await this.courseRepository.find(withdrawCondition, projection, {
          sort: { "updatedAt": -1 },
          skip: skip,
          limit: limit
        })
        for (let course of withdrawnCourses) {
          this.userEnrollmentRepository.setInstanceKey(request.instancekey)
          let enrolled = await this.userEnrollmentRepository.findOne({ item: new Types.ObjectId(course._id), user: new Types.ObjectId(request.userId) },
            { _id: 1 })

          course.enrolled = !!enrolled;
          await this.settings.setPriceByUserCountry(request, course)
        }
        withdrawnEnrolled = withdrawnCourses.filter((c) => c.enrolled);
      }
    } else {
      if (canOnlySeeHisOwnContents(request.userRole)) {
        condition["user._id"] = new Types.ObjectId(request.userId)
      }
      if (request.keywords) {
        let regexText = this.regexName(request.keywords);
        condition.$or = [{ title: regexText }, {
          status: request.keywords
        }]
      }
    }
    if (request.subject) {
      condition["subjects._id"] = new Types.ObjectId(request.subject)
    }
    if (request.level) {
      condition.level = request.level
    }
    if (request.accessMode) {
      condition.accessMode = request.accessMode;
    }
    if (request.price) {
      let pRange = request.price.split("-");
      if (pRange.length > 1) {
        condition.price = {
          $gte: pRange[0],
          $lte: pRange[1],
        }
      } else {
        if (request.price.indexOf(">") === -1) {
          condition.price = { $lte: pRange[0] };
        } else {
          pRange[0] = request.price.replace(">", "");
          condition.price = { $gte: pRange[0] };
        }
      }
    }

    if (request.duration) {
      let pDuration = request.duration.split("-");
      if (pDuration.length > 1) {
        condition.duration = {
          $gte: pDuration[0],
          $lte: pDuration[1]
        }
      } else {
        condition.duration = { $lte: pDuration[0] };
      }
    }

    if (request.author) {
      condition["user._id"] = new Types.ObjectId(request.author)
    }

    let pipeline: any = [{ $match: condition }];

    if (request.userRole.includes("director")) {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "user._id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: "$userInfo" },
        {
          $match: {
            $expr: {
              $cond: [
                { $eq: ["$userInfo.role", "publisher"] },
                { $ne: ["$status", "draft"] },
                {}
              ]
            }
          }
        }
      )
    }
    pipeline.push({ $project: projection }, { $sort: { "updatedAt": -1 } });
    pipeline.push({ $skip: skip }, { $limit: limit });
    this.courseRepository.setInstanceKey(request.instancekey)
    courses = await this.courseRepository.aggregate(pipeline)

    for (let course of courses) {
      if (request.isCheckEnroll) {
        this.userEnrollmentRepository.setInstanceKey(request.instancekey)
        let enrolled = await this.userEnrollmentRepository.findOne(
          {
            item: new Types.ObjectId(course._id),
            user: new Types.ObjectId(request.userId)
          }
        )
        course.enrolled = !!enrolled;
      }
      await this.settings.setPriceByUserCountry(request, course)
    }
    courses = courses.filter((e) => !e.enrolled);

    courses = courses.concat(withdrawnEnrolled);

    if (request.count) {
      return { total: courses.length }
    }

    return { courses }

  }

  async publishSection(request: PublishSectionReq) {
    try {
      if (!request.courseId && !request._id) {
        throw new NotFoundException({ error: 'No course found' });
      }

      const course = await this.courseRepository.findOne({ _id: request.courseId });
      if (!course) {
        throw new NotFoundException({ error: 'No course found' });
      }

      const section = course.sections.find(e => e._id.toString() == request._id.toString())
      if (section && section.contents && section.contents.length < 0) {
        throw new BadRequestException({ error: 'Please add the content inside the section, then only you are able to publish the section!!' });
      }

      // tests in published section need to be published
      const testIds = section.contents.filter(c => c.type == 'quiz' || c.type == 'assessment').map(c => c.source)
      if (testIds.length) {
        const unpublishedTests = await this.practiceSetRepository.countDocuments(
          { _id: { $in: testIds }, status: { $ne: 'published' } }
        )
        if (unpublishedTests > 0) {
          throw new BadRequestException({ error: 'Please publish assessments of this section first.' });
        }
      }

      const status = request.status || 'published'

      const result = await this.courseRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(request.courseId) },
        { $set: { "sections.$[inner].status": status } },
        { arrayFilters: [{ "inner._id": { "$eq": new Types.ObjectId(request._id) } }], new: true }
      )
      return { result }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new GrpcNotFoundException(error.getResponse())
      } else if (error instanceof BadRequestException) {
        throw new GrpcInvalidArgumentException(error.getResponse())
      }
      throw new GrpcInternalException(error)
    }
  }
}

//=====================================================================================================================================================//

async function validateAccess(req, course) {
  if (req.userRole == "teacher") {
    var roleFilter = {
      $or: [
        {
          "user._id": req.userId
        },
        {
          "instructors._id": req.userId,
        },
      ],
    };
    var course: any = {
      _id: course,
    }
    var filter = {
      $and: [roleFilter, course]
    }
    var course = await this.courseRepository.findOne(filter, { _id: 1 });
    if (!course) return false;
  };
  return true;
}