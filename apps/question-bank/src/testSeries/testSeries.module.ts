import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import { TestSeriesController } from './testSeries.controller';
import { TestSeriesService } from './testSeries.service';
import { Attempt, AttemptRepository, AttemptSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema, Course, CourseRepository, CourseSchema, DatabaseModule, Favorite, FavoriteRepository, FavoriteSchema, Location, LocationRepository, LocationSchema, PaymentDetail, PaymentDetailRepository, PaymentDetailSchema, PracticeSet, PracticeSetRepository, PracticeSetSchema, Question, QuestionRepository, QuestionSchema, RedisCaching, RedisClient, Setting, SettingRepository, Settings, SettingSchema, Subject, SubjectRepository, SubjectSchema, TestSeries, TestSeriesRepository, TestSeriesSchema, User, UserEnrollment, UserEnrollmentRepository, UserEnrollmentSchema, UserSchema, UsersRepository } from '@app/common';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const locationEntity = { name: Location.name, schema: LocationSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema };
const favoriteEntity = { name: Favorite.name, schema: FavoriteSchema };
const usersEntity = { name: User.name, schema: UserSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const paymentDetailEntity = { name: PaymentDetail.name, schema: PaymentDetailSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AwsS3Module,
        ...createDatabaseModules([
            practiceSetEntity,
            locationEntity,
            attemptEntity,
            testSeriesEntity,
            settingEntity,
            classroomEntity,
            userEnrollmentEntity,
            favoriteEntity,
            usersEntity,
            subjectEntity,
            paymentDetailEntity,
            questionEntity,
            courseEntity,
        ], instanceKeys),
    ],
    controllers: [TestSeriesController],
    providers: [TestSeriesService,
        PracticeSetRepository,
        LocationRepository,
        AttemptRepository,
        TestSeriesRepository,
        SettingRepository,
        ClassroomRepository,
        UserEnrollmentRepository,
        FavoriteRepository,
        UsersRepository,
        SubjectRepository,
        PaymentDetailRepository,
        QuestionRepository,
        CourseRepository,
        Settings,
        RedisCaching,
        RedisClient,
    ],
})
export class TestSeriesModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
