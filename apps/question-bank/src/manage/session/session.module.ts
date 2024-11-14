import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  Attendance, AttendanceRepository, AttendanceSchema, AwsS3Module, Classroom, ClassroomRepository, ClassroomSchema, Competencies, CompetenciesRepository, CompetenciesSchema, Course, CourseRepository, CourseSchema, DatabaseModule, PracticeSet, PracticeSetRepository, PracticeSetSchema, RedisCaching, RedisClient, SessionManagement, SessionManagementRepository, SessionManagementSchema, Setting, SettingRepository, SettingSchema, Subject, SubjectRepository, SubjectSchema, Unit, UnitRepository, UnitSchema, User, UserSchema, UsersRepository
} from '@app/common';
import { instanceKeys } from '@app/common/config';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };
const attendanceEntity = { name: Attendance.name, schema: AttendanceSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEntity = { name: User.name, schema: UserSchema };
const competenciesEntity = { name: Competencies.name, schema: CompetenciesSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const sessionManagementEntity = { name: SessionManagement.name, schema: SessionManagementSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    ...createDatabaseModules([practiceSetEntity,
      settingEntity,
      attendanceEntity,
      classroomEntity,
      userEntity,
      sessionManagementEntity], instanceKeys),
  ],
  controllers: [SessionController],
  providers: [SessionService,
    PracticeSetRepository,
    SettingRepository,
    AttendanceRepository,
    ClassroomRepository,
    UsersRepository,
    SessionManagementRepository,
    RedisCaching,
    RedisClient],
})
export class SessionModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
