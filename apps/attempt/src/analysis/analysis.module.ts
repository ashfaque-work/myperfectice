import {
    Attempt, AttemptDetail, AttemptDetailRepository, AttemptDetailSchema, AttemptRepository, AttemptSchema,
    Classroom, ClassroomRepository, ClassroomSchema,
    DatabaseModule, TestSeries, TestSeriesRepository, TestSeriesSchema,
    User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository,
} from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { instanceKeys } from "@app/common/config";

const attemptEntity = { name: Attempt.name, schema: AttemptSchema };
const attemptDetailEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema }
const userEntity = { name: User.name, schema: UserSchema }
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema }
const testSeriesEntity = { name: TestSeries.name, schema: TestSeriesSchema }

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    }), DatabaseModule,
    ...createDatabaseModules([
        attemptEntity, attemptDetailEntity, classroomEntity, testSeriesEntity, userEntity, userCourseEntity,
    ], instanceKeys)],
    controllers: [AnalysisController],
    providers: [
        AnalysisService,
        AttemptRepository, AttemptDetailRepository, ClassroomRepository, UsersRepository, UserCourseRepository, TestSeriesRepository,
    ],
})
export class AnalysisModule { }


function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}