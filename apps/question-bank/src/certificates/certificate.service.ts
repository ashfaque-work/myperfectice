import { CourseRepository, UserCourseRepository } from '@app/common';
import { CertificateRepository } from '@app/common/database/repositories/certificate.repository';
import { CreateCertificateRequest, GetPublicProfileCertificatesRequest, IndexRequest } from '@app/common/dto/question-bank.dto';
import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { GrpcInternalException, GrpcInvalidArgumentException } from 'nestjs-grpc-exceptions';

@Injectable()
export class CertificateService {
    constructor(private readonly userCourseRepository: UserCourseRepository,
        private readonly certificateRepository: CertificateRepository,
        private readonly courseRepository: CourseRepository,
    ) { }

    async index(req: IndexRequest) {
        try {
            const page = req.query.page ? (req.query.page, 10) : 1;
            const limit = req.query.limit ? (req.query.limit, 10) : 20;

            this.userCourseRepository.setInstanceKey(req.instancekey);
            var enrolledCourses = await this.userCourseRepository.find({ user: new ObjectId(req.id) },
                { _id: 1, issuedCertificate: 1, issuedCertificateDate: 1 },
                { lean: true, page: page, limit: limit },
                [{ path: 'course', select: 'title expiresOn imageUrl certificate' }]
            )

            // TODO: should have paging here

            enrolledCourses = enrolledCourses.filter(uc => uc.course.certificate)

            return { response: enrolledCourses }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException('Internal Server Error')
        }
    }

    async create(req: CreateCertificateRequest) {
        try {
            if (req.user.roles.includes('student')) {
                throw new UnprocessableEntityException('You are not authorized to add it');
            }
            var body = req.body
            if (!body.course || !body.issuedBy || !body.issuedTo) {
                throw new BadRequestException();
            }


            var certifi = await this.certificateRepository.findOne({
                title: body.title,
                issuedTo: new ObjectId(body.issuedTo)
            })
            if (certifi) {
                throw new BadRequestException('A certificate with this name already exists in your list..')
            }
            var course = await this.courseRepository.findOne({
                _id: new ObjectId(body.course)
            })
            if (course) {
                let certi = await this.certificateRepository.create({
                    title: body.title,
                    description: body.description,
                    issuedBy: new ObjectId(body.issuedBy),
                    issuedTo: new ObjectId(body.issuedTo),
                    course: new ObjectId(body.course),
                    imageUrl: body.imageUrl
                });

                return { _id: certi._id };
            } else {
                throw new BadRequestException('This course is not available now');
            }
        } catch (error) {
            Logger.error(error)
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.message);
            }
            throw new GrpcInternalException("Internal Server Error");
        }
    }

    async getPublicProfileCertificates(req: GetPublicProfileCertificatesRequest) {
        try {
            this.userCourseRepository.setInstanceKey(req.instancekey)
            var enrolledCourses = await this.userCourseRepository.find({ user: new ObjectId(req.id), issuedCertificate: true },
                { _id: 1, issuedCertificateDate: 1 },
                { populate: { path: 'course', select: 'title expiresOn imageUrl' }, lean: true }
            );

            return { response: enrolledCourses }
        } catch (ex) {
            Logger.error(ex)
            throw new GrpcInternalException("Internal Server Error");
        }
    }
}