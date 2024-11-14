import { ClassroomRepository, LocationRepository, ProgramRepository, RedisCaching, SocketClientService, UsersRepository, isEmail } from "@app/common";
import { ChangeActiveInstituteReq, CheckAvailibilityReq, CreateInstituteReq, GetAllLocationsReq, GetInstituteInviteesReq, GetInstituteReq, GetMyInstitutesReq, GetMyOwnInstituteReq, GetProfileProgramsReq, GetPublicProfileReq, InviteToJoinReq, JoinInstituteReq, LeaveInstituteReq, SetDefaultReq, UpdateInstitutePreferncesReq, UpdateInstituteReq } from "@app/common/dto/userManagement/institute.dto";
import { Injectable, Logger } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { GrpcInternalException } from "nestjs-grpc-exceptions";
import * as _ from 'lodash'
import * as slug from 'slug'
import { MessageCenter } from '@app/common/components/messageCenter';

@Injectable()
export class InstituteService {
    constructor(
        private readonly locationRepository: LocationRepository,
        private readonly usersRepository: UsersRepository,
        private readonly programRepository: ProgramRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly redist: RedisCaching,
        private readonly messageCenter: MessageCenter,
        private readonly socketClientService: SocketClientService
    ) { }

    private async inviteTeachers(req, ins, emails) {
        // validate email
        let tosend = []
        let tosendUserId = []
        for (let item of emails) {
            if (!isEmail(item)) {
                return {
                    error: true,
                    msg: 'wrong email format: ' + item
                }
            }

            let existingUser = await this.usersRepository.findOne({ email: item, locations: ins._id })
            let da = {
                invitationAt: new Date(),
                joined: false,
                joinedAt: null,
                email: item
            }

            if (!existingUser) {
                if (ins.invitees.findIndex(e => e.email == item) == -1) {
                    ins.invitees.push(da)
                }

                // check for present user
                let userdetails = await this.usersRepository.findOne({ email: item })
                if (!userdetails) {
                    if (tosend.findIndex(e => e.email == item) == -1) {
                        tosend.push(item)
                    }
                } else {
                    if (tosendUserId.findIndex(e => e.email == userdetails.email) == -1) {
                        tosendUserId.push({ email: userdetails.email, _id: userdetails._id })
                    }
                }
            }
        }

        let settings: any = await this.redist.getSettingAsync(req.instancekey)

        for (let item of tosend) {
            await this.messageCenter.sendWithTemplate(req, 'instittute-invitation', {
                senderName: ins.name,
                logo: settings.baseUrl + 'images/logo2.png',
                siteLink: settings.productName,
                sharingLink: `${settings.baseUrl}signup?joinInstituteAsTeacher=${ins._id}&inName=${encodeURIComponent(ins.name)}&email=${encodeURIComponent(item)}`,
                instituteCode: ins.code,
                subject: 'Perfectice invitation'
            }, {
                modelId: 'shareLink',
                to: item,
                isScheduled: true,
                isEmail: true
            })
        }
        for (let item of tosendUserId) {
            await this.messageCenter.sendWithTemplate(req, 'instittute-invitation', {
                senderName: ins.name,
                logo: settings.baseUrl + 'images/logo2.png',
                siteLink: settings.productName,
                sharingLink: `${settings.baseUrl}signup?joinInstituteAsTeacher=${ins._id}&inName=${encodeURIComponent(ins.name)}&email=${encodeURIComponent(item.email)}`,
                instituteCode: ins.code,
                subject: 'Perfectice invitation'
            }, {
                modelId: 'shareLink',
                to: item.email,
                isScheduled: true,
                isEmail: true,
                receiver: item._id
            })
        }

        return { error: false }
    }

    async getMyInstitutes(request: GetMyInstitutesReq) {
        try {
            let result = await this.locationRepository.find({ _id: { $in: request.user.locations.map(l => new ObjectId(l)) }, active: true }, { name: 1, logo: 1, user: 1, code: 1, isDefault: true })

            return {
                response: result
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getMyOwnInstitute(request: GetMyOwnInstituteReq) {
        try {
            let result = await this.locationRepository.findOne({ user: new ObjectId(request.user._id), active: true }, { name: 1, logo: 1, user: 1, code: 1, isDefault: true })

            if (!result) {
                throw new Error("Not found")
            }

            return {
                ...result
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async getAllLocations(request: GetAllLocationsReq) {
        try {
            const locations = await this.locationRepository.find({ active: true }, { _id: 1, name: 1 }, { lean: true })
            return {
                response: locations
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getInstitute(request: GetInstituteReq) {
        try {
            let query = await this.locationRepository.findOne({ _id: new ObjectId(request.id) })

            let populateObj = [];

            if (request.query.programs) {
                populateObj.push({ path: 'programs', select: 'name' })
            }

            if (request.query.subjects) {
                populateObj.push({ path: 'subjects', select: 'name' })
            }

            if (request.query.teachers) {
                populateObj.push({ path: 'teachers', match: { isActive: true, locations: new ObjectId(request.id) }, select: 'name avatar provider google facebook isActive' })
            }

            const result: any = await this.locationRepository.populate(query, populateObj);

            if (!result) {
                throw new Error('Not found')
            }

            if (request.query.preferencesOnly) {
                return {
                    _id: result._id,
                    user: result.user,
                    preferences: result.preferences
                }
            }
            result.students = await this.usersRepository.countDocuments(
                { roles: { $in: ['student'] }, locations: new ObjectId(request.id), isActive: true }
            )

            return result;
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async getProfilePrograms(request: GetProfileProgramsReq) {
        try {
            let countryCode = request.query.country ? request.query.country : request.user.country.code

            // show either global programs or institute's programs
            let matchQuery = {
                active: true,
                'subjects.0': { $exists: true },
                $and: [
                    {
                        $or: [{ isAllowReuse: 'global' }, { location: new ObjectId(request.id) }],
                    },
                    {
                        $or: [{ 'countries.0': { $exists: false } }, { 'countries.code': countryCode }]
                    }
                ]
            }

            if (request.query?.name) {
                (matchQuery as any).name = {
                    $regex: request.query.name,
                    $options: "i"
                }
            }

            let programs: any = await this.programRepository.aggregate([
                {
                    $match: matchQuery
                },
                {
                    $sort: { updatedAt: -1, name: 1 }
                },
                {
                    $unwind: '$subjects'
                },
                {
                    $lookup: {
                        from: "subjects",
                        let: { sub: "$subjects" },
                        pipeline: [
                            {
                                $match: {
                                    active: true,
                                    $expr: { $eq: ['$$sub', '$_id'] },
                                    $or: [
                                        { isAllowReuse: 'global' },
                                        { location: new ObjectId(request.user.activeLocation) }
                                    ]
                                }
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "subInfo"
                    }
                },
                {
                    $unwind: '$subInfo'
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        active: { $first: '$active' },
                        countries: { $first: '$countries' },
                        updatedAt: { $first: '$updatedAt' },
                        createdBy: { $first: '$createdBy' },
                        subjects: {
                            $push: '$subInfo'
                        }
                    }
                }
            ])

            return {
                response: programs
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async checkAvailibility(request: CheckAvailibilityReq) {
        try {
            let condition = {
                code: request.code.toLowerCase().trim()
            };

            let institute = await this.locationRepository.findOne(condition);

            if (institute) {
                return {
                    status: false,
                    message: 'Already exists'
                }
            } else {
                return {
                    status: true
                }
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getPublicProfile(request: GetPublicProfileReq) {
        try {
            let query = await this.locationRepository.findOne({ _id: new ObjectId(request.id) }, {
                name: 1, code: 1, facebook: 1, linkedIn: 1, whatsapp: 1, youtube: 1, instagram: 1, coverImageUrl: 1, logo: 1, imageUrl: 1, teachers: 1, description: 1, programs: 1, subjects: 1, specialization: 1
            })

            let result: any = await this.locationRepository.populate(query, [
                { path: 'programs', select: 'name', options: { lean: true } },
                { path: 'subjects', select: 'name', options: { lean: true } },
                { path: 'teachers', select: 'name avatar provider google facebook isActive', options: { lean: true } }
            ])

            let tIds = [result.user]

            if (result.teachers.length) {
                result.teachers = result.teachers.filter(t => t.isActive)
                tIds = tIds.concat(result.teachers.filter(t => t.isActive).map(d => d._id))
            }

            let filter = {
                $or: [
                    { user: { $in: tIds } },
                    { owners: { $in: tIds } }
                ]
            }

            let students = await this.classroomRepository.distinct('students.studentId', filter)

            result.students = students.length;

            return {
                ...result
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async getInstituteInvitees(request: GetInstituteInviteesReq) {
        try {
            const ins = await this.locationRepository.findOne({ _id: new ObjectId(request.id) }, { _id: 1, invitees: 1 })

            return {
                ...ins
            }
        } catch (error) {
            throw new GrpcInternalException(error.message)
        }
    }

    async createInstitute(request: CreateInstituteReq) {
        let data = _.pick(request.body, 'name', 'instituteId')
        try {
            let inst: any = {
                name: data.name,
                slugfly: slug(data.name, { lower: true }),
                code: data.instituteId.toLowerCase(),
                user: request.user._id
            }

            if (request.user.coverImageUrl) {
                inst.coverImageUrl = request.user.coverImageUrl;
            }

            if (request.user.specialization) {
                inst.specialization = request.user.specialization;
            }

            if (request.body.subjects && request.body.subjects.length) {
                inst.subjects = _.uniq(request.body.subjects)
            } else {
                inst.subjects = request.user.subjects.map(s => new ObjectId(s))
            }

            let newInstitute = await this.locationRepository.create(inst);

            let updateQuery: any = { activeLocation: newInstitute._id, locations: [newInstitute._id] }

            if (request.user.roles.includes('publisher') === false) {
                await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, {
                    $set: {
                        activeLocation: newInstitute._id,
                        locations: [newInstitute._id],
                    }, $push: { roles: 'director' }
                });
            }

            await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, {
                $set: {
                    activeLocation: newInstitute._id,
                    locations: [newInstitute._id],
                }
            });
            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            this.socketClientService.joinRoom(request.instancekey, request.user._id, 'loc_' + newInstitute._id, false);

            try {
                if (request.body.inviteTeachers) {
                    await this.inviteTeachers(request, newInstitute, request.body.inviteTeachers)
                }

                if (newInstitute.subjects.length) {
                    // update director subjects
                    await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, { $addToSet: { subjects: { $each: newInstitute.subjects } } })
                }

                return {
                    ...newInstitute
                }
            } catch (error) {
                throw new Error(error)
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async joinInstitute(request: JoinInstituteReq) {
        try {
            if (!request.body.code) {
                throw new Error('Not found')
            }

            let ins = await this.locationRepository.findOne({ code: request.body.code.toLowerCase().trim() })

            if (!ins) {
                throw new Error('Not found')
            }

            // for publisher's institute, user can only join by invitation
            if (ins.type == 'publisher' && !ins.invitees.find(i => i.email == request.user.email)) {
                throw new Error('You cannot join as this is an invitation only Institute.')
            }

            if (request.user.roles.includes('teacher')) {
                await this.locationRepository.updateOne({ _id: ins._id }, {
                    $addToSet: { teachers: new ObjectId(request.user._id) }
                })

                await this.locationRepository.updateOne({ _id: ins._id, 'invitees.email': request.user.email }, { $set: { "invitees.$.joined": true, "invitees.$.joinedAt": new Date() } })
            }

            await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, {
                $set: { activeLocation: ins._id, onboarding: true },
                $addToSet: { locations: ins._id }
            })
            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            this.socketClientService.joinRoom(request.instancekey, request.user._id, 'loc_' + ins._id, false)

            return {
                institute: ins._id
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async leaveInstitute(request: LeaveInstituteReq) {
        try {
            if (!request.body.id) {
                throw new Error('Not found')
            }

            if (request.user.roles.includes('teacher')) {
                await this.locationRepository.updateOne({ _id: new ObjectId(request.body.id) }, {
                    $pull: { teachers: new ObjectId(request.user._id) }
                })
            }

            let updateQuery = { $set: { activeLocation: null }, $pull: { locations: request.body.id } }
            const instituteId = new ObjectId(request.body.id);
            let nextActiveLocation = request.user.locations.find(l => !l.equals(instituteId));
            if (nextActiveLocation) {
                updateQuery.$set = { activeLocation: nextActiveLocation }
            }

            await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, updateQuery)

            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            this.socketClientService.leaveRoom(request.instancekey, request.user._id, 'loc_' + request.body.id)

            return {
                response: 'ok'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async setDefault(request: SetDefaultReq) {
        try {
            let defaultIns = await this.locationRepository.findOne({ active: true, isDefault: true })
            if (defaultIns) {
                await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, {
                    $addToSet: { locations: defaultIns._id },
                    $set: { activeLocation: defaultIns._id, onboarding: true }
                })

                if (request.user.roles.includes('teacher')) {
                    await this.locationRepository.updateOne({ _id: defaultIns._id }, { $addToSet: { teachers: new ObjectId(request.user._id) } })
                }
                await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
                this.socketClientService.joinRoom(request.instancekey, request.user._id, 'loc_' + defaultIns._id, false)
            } else {
                Logger.warn("No default location found for the instance" + request.instancekey);
            }

            return {
                response: "ok"
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async inviteToJoin(request: InviteToJoinReq) {
        try {
            if (!request.body.emails || !request.body.emails.length) {
                throw new Error('Not found')
            }

            let ins = await this.locationRepository.findById(new ObjectId(request.id))
            if (!ins) {
                throw new Error('Not found')
            }

            let result = await this.inviteTeachers(request, ins, request.body.emails)
            if (result.error) {
                throw new Error('Not found')
            }

            return {
                response: 'OK'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async changeActiveInstitute(request: ChangeActiveInstituteReq) {
        try {
            if (!request.body.instituteId) {
                throw new Error('Not found')
            }

            let previousLoc = new ObjectId(request.user.activeLocation);

            await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, { $set: { activeLocation: request.body.instituteId } })

            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            if (previousLoc) {
                this.socketClientService.leaveRoom(request.instancekey, request.user._id, 'loc_' + request.body.instituteId, false)
            }

            this.socketClientService.joinRoom(request.instancekey, request.user._id, 'loc_' + request.body.instituteId, false)

            return {
                response: 'ok'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateInstitute(request: UpdateInstituteReq) {
        try {
            let data = _.omit(request.body, 'createdAt');
            let institute = await this.locationRepository.findOne({ _id: request.id })
            if (request.body.name) {
                institute.name = data.name;
                institute.slugfly = slug(data.name, { lower: true });
            }

            if (request.body.description != undefined) {
                institute.description = data.description;
            }

            if (request.body.subjects) {
                institute.subjects = _.uniq(data.subjects)
            }

            if (request.body.preferences) {
                institute.preferences = data.preferences;
            }

            if (request.body.teacher) {
                if (!institute.teachers)
                    institute.teachers = []

                institute.teachers.push(request.body.teacher)
            }

            if (request.body.imageUrl != undefined) {
                institute.imageUrl = data.imageUrl
            }

            if (request.body.coverImageUrl != undefined) {
                institute.coverImageUrl = data.coverImageUrl
            }

            if (request.body.programs) {
                institute.programs = data.programs;
            }

            if (request.body.specialization) {
                institute.specialization = data.specialization;
            }

            if (request.body.google != undefined) {
                institute.google = data.google
            }

            if (request.body.twitter != undefined) {
                institute.twitter = data.twitter
            }

            if (request.body.facebook != undefined) {
                institute.facebook = data.facebook
            }

            if (request.body.instagram != undefined) {
                institute.instagram = data.instagram
            }

            if (request.body.youtube != undefined) {
                institute.youtube = data.youtube
            }

            if (request.body.linkedIn != undefined) {
                institute.linkedIn = data.linkedIn
            }

            await this.locationRepository.updateOne({ _id: institute._id }, institute)

            if (request.body.subjects) {
                // update director subjects 
                await this.usersRepository.updateOne({ _id: new ObjectId(request.user._id) }, { $addToSet: { subjects: { $each: institute.subjects } } })
            }

            return {
                response: 'Ok'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateInstitutePrefernces(request: UpdateInstitutePreferncesReq) {
        try {
            if (!request.body.preferences) {
                throw new Error('Not found')
            }

            const user = await this.locationRepository.updateOne({
                _id: request.id
            }, {
                $set: {
                    preferences: request.body.preferences
                }
            })
            await this.socketClientService.initializeSocketConnection(request.instancekey, request.token);
            this.socketClientService.notifyRoom(request.instancekey, 'loc_' + request.id, 'preferences.updated', { locId: request.id.toString(), preferences: request.body.preferences })

            return {
                response: 'ok'
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}