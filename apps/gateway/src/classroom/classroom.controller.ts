import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Headers, Query, Req, Ip, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ClassroomService } from './classroom.service';
import {
    AddFolderItemReq, AddStudentsReq, AddToClsWatchListReq, AssignAssignmentMarksReq, AssignMentorTasksReq, CheckAllowAddReq,
    CreateAssignmentReq, CreateClassroomReq, EditTeacherAssignmentReq, FindByIdReq, FindMeReq, ImportMentorReq, ImportStudentAdminReq,
    ImportStudentReq, RemoveStudentReq, SaveAsReq, SetDailyGoalsReq, StartWbSessionReq, UpdateAttendantReq, UpdateClassStatusReq,
    UpdateClassroomReq, UpdateSteamingStatusReq, UpdateStudentAssignmentReq, UpdateStudentStatusReq, UpdateTeacherAssignmentsStatusReq
} from '@app/common/dto/classroom.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Classroom')
@Controller('classrooms')
export class ClassroomController {

    constructor(private classroomService: ClassroomService) { }

    @Get('/findAll')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'publisher', 'support', 'operator', 'mentor', 'admin', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiQuery({ name: 'location', required: false, description: 'Filter classroom by location', type: String })
    findAll(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('location') location: string,
    ) {
        return this.classroomService.findAll({ location, user: req.user, instancekey });
    }

    @Get('/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'home', required: false, type: Boolean })
    @ApiQuery({ name: 'searchText', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'checkSession', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    async findMe(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('home') home: string,
        @Query('searchText') searchText: string,
        @Query('name') name: string,
        @Query('locations') locations: string,
        @Query('checkSession') checkSession: string
    ) {
        const findMeReq: FindMeReq = {
            instancekey,
            user: req.user,
            query: {
                page,
                limit,
                home: home === 'true',
                searchText,
                name,
                locations,
                checkSession: checkSession === 'true',
            },
        };
        return this.classroomService.findMe(findMeReq);
    }

    @Get('/countMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'searchText', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    async countMe(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('searchText') searchText: string,
        @Query('name') name: string,
        @Query('locations') locations: string
    ) {
        const findMeReq: FindMeReq = {
            instancekey,
            user: req.user,
            query: { searchText, name, locations }
        };
        return this.classroomService.countMe(findMeReq);
    }

    @Get('/locations/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'all', required: false, type: Boolean })
    @ApiQuery({ name: 'name', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    async getLocationByMe(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('sort') sort: string,
        @Query('all') all: string,
        @Query('name') name: string
    ) {
        const findMeReq: FindMeReq = {
            instancekey,
            user: req.user,
            query: { sort, all: all === 'true', name }
        };
        return this.classroomService.getLocationByMe(findMeReq);
    }

    @Get('/findMentorClassroom')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'checkSession', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    async findMentorClassroom(
        @Req() req: any,
        @Headers('instancekey') instancekey: string,
        @Query('checkSession') checkSession: string
    ) {
        const findMeReq: FindMeReq = {
            instancekey,
            user: req.user,
            query: { checkSession: checkSession === 'true' }
        };
        return this.classroomService.findMentorClassroom(findMeReq);
    }

    @Get('/me/findOne/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findMeOneById(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Req() req,
    ) {
        return this.classroomService.findMeOneById({ _id: id, instancekey, user: req.user });
    }

    @Get('/me/findOne')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'neClassRoom', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @Roles(['teacher', 'publisher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    findMeOne(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('neClassRoom') neClassRoom: string,
        @Query('name') name: string
    ) {
        return this.classroomService.findMeOne({ instancekey, user: req.user, query: { neClassRoom, name } });
    }

    @Get('/findById/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'assignment', required: false, type: Boolean })
    @ApiQuery({ name: 'classroomSetting', required: false, type: Boolean })
    @ApiQuery({ name: 'includeUser', required: false, type: Boolean })
    @ApiQuery({ name: 'owners', required: false, type: Boolean })
    @ApiQuery({ name: 'includeStudentInfo', required: false, type: Boolean })
    @ApiQuery({ name: 'studentNotCount', required: false, type: Boolean })
    @ApiQuery({ name: 'checkSession', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    findById(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('assignment') assignment: string,
        @Query('classroomSetting') classroomSetting: string,
        @Query('includeUser') includeUser: string,
        @Query('owners') owners: string,
        @Query('includeStudentInfo') includeStudentInfo: string,
        @Query('studentNotCount') studentNotCount: string,
        @Query('checkSession') checkSession: string,
    ) {
        const findByIdReq: FindByIdReq = {
            _id: id,
            instancekey,
            query: {
                assignment: assignment === 'true',
                classroomSetting: classroomSetting === 'true',
                includeUser: includeUser === 'true',
                owners: owners === 'true',
                includeStudentInfo: includeStudentInfo === 'true',
                studentNotCount: studentNotCount === 'true',
                checkSession: checkSession === 'true',
            },
            user: req.user,
        };
        return this.classroomService.findById(findByIdReq);
    }

    @Get('/findStudents')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'isExport', required: false, type: Boolean })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'inactive', required: false, type: Boolean })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'chatSupport', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    findStudents(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('isExport') isExport: string,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('inactive') inactive: string,
        @Query('name') name: string,
        @Query('sort') sort: string,
        @Query('chatSupport') chatSupport: string
    ) {
        return this.classroomService.findStudents(
            {
                instancekey, user: req.user,
                query: {
                    isExport: isExport === 'true',
                    inactive: inactive === 'true',
                    chatSupport: chatSupport === 'true',
                    classroom, locations, page, limit, name, sort
                },
                token: req.headers['authtoken']
            }
        );
    }

    @Get('/countStudents')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'all', required: false, type: Boolean })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    countStudents(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('all') all: string,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('name') name: string
    ) {
        return this.classroomService.countStudents(
            {
                instancekey, user: req.user,
                query: {
                    all: all === 'true', classroom, locations, name
                }
            }
        );
    }

    @Get('/findTeachers/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'count', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'chatSupport', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    findTeachers(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('name') name: string,
        @Query('count') count: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('chatSupport') chatSupport: string
    ) {
        return this.classroomService.findTeachers(
            {
                _id: id, instancekey, user: req.user,
                query: {
                    name, page, limit,
                    count: count === 'true',
                    chatSupport: chatSupport === 'true'
                },
                token: req.headers['authtoken']
            }
        );
    }

    @Get('/findClassroomStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'count', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'chatSupport', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    async findClassroomStudents(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('name') name: string,
        @Query('count') count: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('chatSupport') chatSupport: string
    ) {     
        return this.classroomService.findClassroomStudents(
            {
                _id: id, instancekey, user: req.user,
                query: {
                    name, page, limit,
                    count: count === 'true',
                    chatSupport: chatSupport === 'true'
                },
                token: req.headers['authtoken'],
            }
        );
    }

    @Get('/findAllClassroomsMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'isExport', required: false, type: Boolean })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'inactive', required: false, type: Boolean })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'chatSupport', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    findAllClassrooms(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('isExport') isExport: string,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('inactive') inactive: string,
        @Query('name') name: string,
        @Query('sort') sort: string,
        @Query('chatSupport') chatSupport: string
    ) {
        return this.classroomService.findStudents(
            {
                instancekey, user: req.user,
                query: {
                    isExport: isExport === 'true',
                    inactive: inactive === 'true',
                    chatSupport: chatSupport === 'true',
                    classroom, locations, page, limit, name, sort
                }
            }
        );
    }

    @Get('/summaryAttemptedAllClassrooms')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'interval', required: false, type: String })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomSummaryAttemptedAllClassrooms(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('interval') interval: string,
        @Query('practice') practice: string,
        @Query('mymentee') mymentee: string,
        @Query('lastDay') lastDay: string,
        @Query('subjects') subjects: string
    ) {
        return this.classroomService.classroomSummaryAttemptedAllClassrooms(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    classroom, locations, interval, practice, lastDay, subjects
                }
            }
        );
    }

    @Get('/findByClassRoom')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'multiStatus', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiQuery({ name: 'notCheckExpiresOn', required: false, type: Boolean })
    @ApiQuery({ name: 'expired', required: false, type: String })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @ApiQuery({ name: 'testMode', required: false, type: String })
    @ApiQuery({ name: 'levels', required: false, type: String })
    @ApiQuery({ name: 'unit', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    findByClassRoom(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('subjects') subjects: string,
        @Query('classroom') classroom: string,
        @Query('multiStatus') multiStatus: string,
        @Query('status') status: string,
        @Query('notCheckExpiresOn') notCheckExpiresOn: string,
        @Query('expired') expired: string,
        @Query('keyword') keyword: string,
        @Query('testMode') testMode: string,
        @Query('levels') levels: string,
        @Query('unit') unit: string,
        @Query('locations') locations: string,
    ) {
        return this.classroomService.findByClassRoom(
            {
                instancekey, user: req.user,
                query: {
                    page, limit, subjects, classroom, multiStatus, status,
                    notCheckExpiresOn: notCheckExpiresOn === 'true',
                    expired, keyword, testMode, levels, unit, locations
                }
            }
        );
    }

    @Get('/countByClassRoom')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'multiStatus', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiQuery({ name: 'notCheckExpiresOn', required: false, type: Boolean })
    @ApiQuery({ name: 'expired', required: false, type: String })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @ApiQuery({ name: 'testMode', required: false, type: String })
    @ApiQuery({ name: 'levels', required: false, type: String })
    @ApiQuery({ name: 'unit', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    countByClassRoom(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('subjects') subjects: string,
        @Query('classroom') classroom: string,
        @Query('multiStatus') multiStatus: string,
        @Query('status') status: string,
        @Query('notCheckExpiresOn') notCheckExpiresOn: string,
        @Query('expired') expired: string,
        @Query('keyword') keyword: string,
        @Query('testMode') testMode: string,
        @Query('levels') levels: string,
        @Query('unit') unit: string,
        @Query('locations') locations: string,
    ) {
        return this.classroomService.countByClassRoom(
            {
                instancekey, user: req.user,
                query: {
                    page, limit, subjects, classroom, multiStatus, status,
                    notCheckExpiresOn: notCheckExpiresOn === 'true',
                    expired, keyword, testMode, levels, unit, locations
                }
            }
        );
    }

    @Get('/listSubjectStudentDo')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    listSubjectStudentDo(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('practice') practice: string,
        @Query('mymentee') mymentee: string,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('lastDay') lastDay: string,
        @Query('subjects') subjects: string
    ) {
        return this.classroomService.listSubjectStudentDo(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/summaryQuestionBySubject')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomSummaryQuestionBySubject(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('locations') locations: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('lastDay') lastDay: string,
        @Query('mymentee') mymentee: string,
        @Query('practice') practice: string,
    ) {
        return this.classroomService.classroomSummaryQuestionBySubject(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/listTopicStudentDo')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomListTopicStudentDo(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('locations') locations: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('lastDay') lastDay: string,
        @Query('mymentee') mymentee: string,
        @Query('practice') practice: string,
    ) {
        return this.classroomService.classroomListTopicStudentDo(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/summaryQuestionByTopic')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomSummaryQuestionByTopic(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('locations') locations: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('lastDay') lastDay: string,
        @Query('mymentee') mymentee: string,
        @Query('practice') practice: string,
    ) {
        return this.classroomService.classroomSummaryQuestionByTopic(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/summaryCorrectByDate')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'topic', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomSummaryCorrectByDate(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('locations') locations: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('topic') topic: string,
        @Query('lastDay') lastDay: string,
        @Query('mymentee') mymentee: string,
        @Query('practice') practice: string,
    ) {
        return this.classroomService.classroomSummaryCorrectByDate(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, topic, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/summaryCorrect')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    classroomSummaryCorrect(
        @Headers('instancekey') instancekey: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('practice') practice: string,
    ) {
        return this.classroomService.classroomSummaryCorrect({ instancekey, query: { practice, subjects, classroom } });
    }

    @Get('/getClassRoomByLocation')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'locationsIds', required: true, type: String })
    @UseGuards(AuthenticationGuard)
    getClassRoomByLocation(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('locationsIds') locationsIds: string,
    ) {
        return this.classroomService.getClassRoomByLocation({ instancekey, user: req.user, query: { locationsIds } });
    }

    @Get('/leaderboard')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: true, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    getClassroomLeaderBoard(
        @Headers('instancekey') instancekey: string,
        @Query('classroom') classroom: string,
        @Query('subjects') subjects: string,
        @Query('practice') practice: string
    ) {
        return this.classroomService.getClassroomLeaderBoard({ instancekey, query: { practice, subjects, classroom } });
    }

    @Get('/files/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getFiles(@Param('id') id: string, @Headers('instancekey') instancekey: string
    ) {
        return this.classroomService.getFiles({ _id: id, instancekey });
    }

    @Get('/getClassroomByUserLocation')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'course', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    getClassroomByUserLocation(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('course') course: string,
    ) {
        return this.classroomService.getClassroomByUserLocation({ instancekey, user: req.user, query: { course: course === 'true' } });
    }

    @Get('/subjectAccuracyAndSpeed')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'practice', required: false, type: String })
    @ApiQuery({ name: 'subjects', required: false, type: String })
    @ApiQuery({ name: 'mymentee', required: false, type: Boolean })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'locations', required: false, type: String })
    @ApiQuery({ name: 'lastDay', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    findSubjectAccuracyAndSpeed(
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('practice') practice: string,
        @Query('subjects') subjects: string,
        @Query('mymentee') mymentee: string,
        @Query('classroom') classroom: string,
        @Query('locations') locations: string,
        @Query('lastDay') lastDay: string,
    ) {
        return this.classroomService.findSubjectAccuracyAndSpeed(
            {
                instancekey, user: req.user,
                query: {
                    mymentee: mymentee === 'true',
                    practice, subjects, classroom, locations, lastDay
                }
            }
        );
    }

    @Get('/getStreamingUrlAndStatus/:id')
    getStreamingUrlAndStatus(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getStreamingUrlAndStatus({ _id: id, instancekey });
    }

    @Get('/attendants/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @Roles(['teacher', 'publisher', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getAttendants(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Headers('timezoneoffset') timezoneoffset: string,
        @Req() req,
        @Query('name') name: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ) {
        return this.classroomService.getAttendants(
            { _id: id, instancekey, timezoneoffset, user: req.user, query: { name, page, limit } }
        );
    }

    @Get('/countAttendants/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'name', required: false, type: String })
    @Roles(['teacher', 'publisher', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    countAttendants(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Query('name') name: string
    ) {
        return this.classroomService.countAttendants(
            { _id: id, instancekey, query: { name } }
        );
    }

    @Get('/findStudent/:studentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'isMentee', required: false, type: Boolean })
    @ApiQuery({ name: 'isMyCircle', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    findStudent(
        @Param('studentId') studentId: string,
        @Headers('instancekey') instancekey: string,
        @Req() req,
        @Query('isMentee') isMentee: string,
        @Query('isMyCircle') isMyCircle: string,
    ) {
        return this.classroomService.findStudent({
            _id: studentId, instancekey, user: req.user,
            query: {
                isMentee: isMentee === 'true',
                isMyCircle: isMyCircle === 'true',
            }
        });
    }

    //Assignments
    @Get('/getAllAssignments/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAllAssignments(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getAllAssignments({ _id: id, instancekey });
    }

    @Get('/recentEvaluatedAssignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    @ApiQuery({ name: 'classroom', required: true, type: String })
    recentEvaluatedAssignment(@Headers('instancekey') instancekey: string, @Query('classroom') classroom: string) {
        return this.classroomService.recentEvaluatedAssignment({ instancekey, query: { classroom } });
    }

    @Get('/getAllAssignmentByCount')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'assignment', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    getAllAssignmentByCount(@Headers('instancekey') instancekey: string, @Query('classroom') classroom: string, @Query('assignment') assignment: string) {
        return this.classroomService.getAllAssignmentByCount({ instancekey, classroom, assignment });
    }

    @Get('/getAssignmentById')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'assignment', required: false, type: String })
    @ApiQuery({ name: 'teacher', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    getAssignmentById(
        @Headers('instancekey') instancekey: string,
        @Query('classroom') classroom: string,
        @Query('assignment') assignment: string,
        @Query('teacher') teacher: string
    ) {
        return this.classroomService.getAssignmentById({ instancekey, classroom, assignment, teacher: teacher === 'true', });
    }

    @Post('/updateStudentAssignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateStudentAssignment(@Body() request: UpdateStudentAssignmentReq, @Headers('instancekey') instancekey: string, @Req() req) {
        return this.classroomService.updateStudentAssignment({ ...request, instancekey, user: req.user });
    }

    @Get('/getUserAssignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'classroom', required: false, type: String })
    @ApiQuery({ name: 'assignment', required: false, type: String })
    @ApiQuery({ name: 'student', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    getUserAssignment(
        @Headers('instancekey') instancekey: string,
        @Query('classroom') classroom: string,
        @Query('assignment') assignment: string,
        @Query('student') student: string
    ) {
        return this.classroomService.getUserAssignment({ instancekey, query: { classroom, assignment, student } });
    }

    @Put('/editStudentAssignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    editStudentAssignment(@Body() request: UpdateStudentAssignmentReq, @Headers('instancekey') instancekey: string, @Req() req) {
        return this.classroomService.updateStudentAssignment({ ...request, instancekey, user: req.user });
    }

    @Put('/assignAssignmentMarks')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    assignAssignmentMarks(@Body() request: AssignAssignmentMarksReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.assignAssignmentMarks({ ...request, instancekey });
    }

    @Get('/getAllUserAssignment/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAllUserAssignment(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Req() req) {
        return this.classroomService.getAllUserAssignment({ _id: id, instancekey, user: req.user });
    }

    @Post('/createAssignment/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createAssignment(@Param('id') id: string, @Body() request: CreateAssignmentReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.createAssignment({ ...request, _id: id, instancekey });
    }

    @Get('/getTeacherAssignments/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'status', required: false, type: String })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getTeacherAssignments(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('status') status: string) {
        return this.classroomService.getTeacherAssignments({ _id: id, instancekey, status });
    }

    @Put('/updateTeacherAssignmentsStatus')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateTeacherAssignmentsStatus(@Body() request: UpdateTeacherAssignmentsStatusReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.updateTeacherAssignmentsStatus({ ...request, instancekey });
    }

    @Delete('/deleteTeacherAssignment/:classroom/:assignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteTeacherAssignment(@Param('classroom') classroom: string, @Param('assignment') assignment: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.deleteTeacherAssignment({ classroom, assignment, instancekey });
    }

    @Put('/editTeacherAssignment/:classroom/:assignment')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    editTeacherAssignment(
        @Param('classroom') classroom: string, @Param('assignment') assignment: string,
        @Body() request: EditTeacherAssignmentReq, @Headers('instancekey') instancekey: string
    ) {
        return this.classroomService.editTeacherAssignment({ ...request, classroom, assignment, instancekey });
    }

    @Get('/wbSessions')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'count', required: false, type: Boolean })
    @Roles(['admin', 'director', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getWbSessions(
        @Headers('instancekey') instancekey: string, @Req() req,
        @Query('page') page: number, @Query('limit') limit: number, @Query('count') count: string
    ) {
        return this.classroomService.getWbSessions(
            {
                instancekey, user: req.user, query: { page, limit, count: count === 'true' }
            }
        );
    }

    @Put('/addFolderItem')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    addFolderItem(@Body() request: AddFolderItemReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.addFolderItem({ instancekey, ...request });
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student', 'teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateClassroom(@Param('id') id: string, @Body() request: UpdateClassroomReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.updateClassroom({ _id: id, instancekey, ...request });
    }

    @Put('/resetWbSession/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    resetWbSession(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.resetWbSession({ _id: id, instancekey });
    }

    @Put('/attendant/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'centerHead', 'director', 'admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateAttendant(
        @Param('id') id: string, @Body() request: UpdateAttendantReq, @Req() req,
        @Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string
    ) {
        return this.classroomService.updateAttendant({ ...request, _id: id, instancekey, timezoneoffset, user: req.user });
    }

    @Put('/updateSteamingStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateSteamingStatus(@Param('id') id: string, @Body() request: UpdateSteamingStatusReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.updateSteamingStatus({ ...request, _id: id, instancekey });
    }

    @Put('/updateStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateStudentStatus(@Param('id') id: string, @Body() request: UpdateStudentStatusReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.updateStudentStatus({ ...request, _id: id, instancekey });
    }

    @Put('/saveAs/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    saveAs(
        @Param('id') id: string, @Body() request: SaveAsReq,
        @Headers('instancekey') instancekey: string, @Req() req
    ) {
        return this.classroomService.saveAs({ ...request, _id: id, instancekey, user: req.user });
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    createClassroom(@Body() request: CreateClassroomReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.classroomService.createClassroom({ ...request, user: req.user, instancekey });
    }

    @Post('/startWbSession')
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @ApiHeader({ name: 'authtoken', required: true })
    startWbSession(
        @Body() request: StartWbSessionReq, @Req() req: any,
        @Headers('instancekey') instancekey: string, @Ip() ip: string
    ) {
        return this.classroomService.startWbSession({ ...request, user: req.user, instancekey, ip, token: req.headers['authtoken'] });
    }

    @Post('addStudents')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addStudents(@Body() request: AddStudentsReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.classroomService.addStudents({ ...request, user: req.user, instancekey, token: req.headers['authtoken'] });
    }

    @Post('removeStudent')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    removeStudent(@Body() request: RemoveStudentReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.classroomService.removeStudent({ ...request, user: req.user, instancekey, token: req.headers['authtoken'] })
    }

    @Post('checkAllowAdd')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    checkAllowAdd(@Body() request: CheckAllowAddReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.classroomService.checkAllowAdd({ ...request, user: req.user, instancekey })
    }

    @Post('/importStudent')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                classRoom: { type: 'string' },
                mentorEmail: { type: 'string' },
            },
        },
    })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importStudent(
        @Body() request: ImportStudentReq, @UploadedFile() file: Express.Multer.File,
        @Req() req: any, @Headers('instancekey') instancekey: string
    ) {
        return this.classroomService.importStudent({ ...request, file, instancekey, user: req.user, });
    }

    @Post('/importMentorMentees')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                mentorEmail: { type: 'string' }
            },
        },
    })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'support'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importMentor(
        @Body() request: ImportMentorReq, @UploadedFile() file: Express.Multer.File,
        @Req() req: any, @Headers('instancekey') instancekey: string
    ) {
        return this.classroomService.importMentor({ ...request, file, instancekey, user: req.user, });
    }

    @Post('/importStudentAdmin')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                resetPass: { type: 'string' }
            },
        },
    })
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['admin', 'director', 'support', 'publisher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async importStudentAdmin(
        @Body() request: ImportStudentAdminReq, @UploadedFile() file: Express.Multer.File,
        @Req() req: any, @Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string
    ) {
        return this.classroomService.importStudentAdmin({ ...request, file, instancekey, timezoneoffset, user: req.user, token: req.headers['authtoken'] });
    }

    @Get('getClassroomStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'count', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    getClassroomStudents(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('name') name: string,
        @Query('count') count: string,
    ) {
        return this.classroomService.getClassroomStudents(
            { _id: id, instancekey, query: { page, limit, name, count: count === 'true' } }
        );
    }

    @Get('getAllStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAllStudents(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getAllStudents({ _id: id, instancekey });
    }

    @Put('/updateClassStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    updateClassStatus(@Param('id') id: string, @Body() request: UpdateClassStatusReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.updateClassStatus({ _id: id, instancekey, ...request });
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteClassroom(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.classroomService.deleteClassroom({ _id: id, user: req.user, instancekey });
    }

    @Delete('/deleteFolderItem/:id/:itemId')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'admin', 'support', 'centerHead', 'publisher', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteFolderItem(@Param('id') id: string, @Param('itemId') itemId: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.deleteFolderItem({ _id: id, itemId, instancekey });
    }

    @Get('getRequestStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getRequestStudents(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sort') sort?: string
    ) {
        return this.classroomService.getRequestStudents({ _id: id, instancekey, page, limit, sort })
    }

    @Get('getMentorStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'name', required: false })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getMentorStudents(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('name') name?: string
    ) {
        return this.classroomService.getMentorStudents({ _id: id, instancekey, query: { page, limit, name } })
    }

    @Get('getMentoringTime')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getMentoringTime(@Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.classroomService.getMentoringTime({ instancekey, user: req.user })
    }

    @Get('/getPracticeTime/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'studentId', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Boolean })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getPracticeTime(
        @Param('id') id: string, @Headers('instancekey') instancekey: string,
        @Query('studentId') studentId: string, @Query('limit') limit: string,
    ) {
        return this.classroomService.getPracticeTime({ _id: id, instancekey, studentId, limit: limit === 'true' })
    }

    @Get('/getLearningTime/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'studentId', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Boolean })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getLearningTime(
        @Param('id') id: string, @Headers('instancekey') instancekey: string,
        @Query('studentId') studentId: string, @Query('limit') limit: string,
    ) {
        return this.classroomService.getLearningTime({ _id: id, instancekey, studentId, limit: limit === 'true' })
    }

    @Get('/getLeastPracticeTime/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getLeastPracticeTime(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getLeastPracticeTime({ _id: id, instancekey })
    }

    @Get('/getMentorStudentData/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getMentorStudentData(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getMentorStudentData({ _id: id, instancekey })
    }

    @Get('/todayAttemptQuestions/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    todayAttemptQuestions(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.todayAttemptQuestions({ _id: id, instancekey })
    }

    @Get('/getClassroomStudent/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'studentId', required: false, type: String })
    @Roles(['mentor', 'teacher'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    getClassroomStudent(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('studentId') studentId: string) {
        return this.classroomService.getClassroomStudent({ _id: id, studentId, instancekey })
    }

    @Get('/findReviewStudents/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findReviewStudents(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.findReviewStudents({ _id: id, instancekey })
    }

    @Get('/getAssignedTasks/:classId')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'studentId', required: true, type: String })
    @UseGuards(AuthenticationGuard)
    getAssignedTasks(@Param('classId') classId: string, @Headers('instancekey') instancekey: string, @Query('studentId') studentId: string) {
        return this.classroomService.getAssignedTasks({ _id: classId, studentId, instancekey })
    }

    @Put('/assignMentorTasks/:classId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    assignMentorTasks(@Param('classId') classId: string, @Body() request: AssignMentorTasksReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.assignMentorTasks({ ...request, _id: classId, instancekey })
    }

    @Get('/getStudentAssignedTasks/:studentId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getStudentAssignedTasks(@Param('studentId') studentId: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getStudentAssignedTasks({ _id: studentId, instancekey })
    }

    @Put('/addToClsWatchList/:classId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    addToClsWatchList(@Param('classId') classId: string, @Body() request: AddToClsWatchListReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.addToClsWatchList({ ...request, _id: classId, instancekey })
    }

    @Get('/getWatchListStatus/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'studentId', required: true, type: String })
    @UseGuards(AuthenticationGuard)
    getWatchListStatus(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Query('studentId') studentId: string) {
        return this.classroomService.getWatchListStatus({ _id: id, studentId, instancekey })
    }

    @Put('/setDailyGoals/:classId')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    setDailyGoals(@Param('classId') classId: string, @Body() request: SetDailyGoalsReq, @Headers('instancekey') instancekey: string) {
        return this.classroomService.setDailyGoals({ ...request, _id: classId, instancekey })
    }

    @Get('/sessionInfo/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getSessionInfo(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getSessionInfo({ _id: id, instancekey })
    }

    @Get('/joinSession/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    joinSession(@Param('id') id: string, @Headers('instancekey') instancekey: string, @Req() req: any) {
        return this.classroomService.joinSession({ _id: id, instancekey, user: req.user })
    }

    @Get('/getRecordings/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getRecordings(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getRecordings({ _id: id, instancekey })
    }

    @Get('/getPublicMentorStudents/:id')
    getPublicMentorStudents(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.classroomService.getPublicMentorStudents({ _id: id, instancekey })
    }

    @Get(':id/students')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'ongoingTest', required: false, type: String })
    @ApiQuery({ name: 'includeCount', required: false, type: Boolean })
    @UseGuards(AuthenticationGuard)
    getStudents(
        @Param('id') id: string,
        @Headers('instancekey') instancekey: string,
        @Headers('timezoneoffset') timezoneoffset: string,
        @Query('limit') limit: number,
        @Query('page') page: number,
        @Query('search') search: string,
        @Query('ongoingTest') ongoingTest: string,
        @Query('includeCount') includeCount: string,
    ) {
        return this.classroomService.getStudents(
            { _id: id, instancekey, timezoneoffset, query: { page, limit, search, ongoingTest, includeCount: includeCount === 'true' } }
        );
    }
}
