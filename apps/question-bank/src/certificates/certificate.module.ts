import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import {  AwsS3Module, Certificate, CertificateSchema, Course, CourseRepository, CourseSchema, DatabaseModule, User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository } from '@app/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { CertificateRepository } from '@app/common/database/repositories/certificate.repository';

const userEntity = { name: User.name, schema: UserSchema };
const userCourseEntity = { name: UserCourse.name, schema: UserCourseSchema };
const courseEntity = { name: Course.name, schema: CourseSchema };
const certificateEntity = { name: Certificate.name, schema: CertificateSchema };


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    ...createDatabaseModules([
      userEntity,
      userCourseEntity,
      courseEntity,
      certificateEntity,
    ], instanceKeys),
  ],
  controllers: [CertificateController],
  providers: [CertificateService,    
    UsersRepository,    
    UserCourseRepository,
    CourseRepository,
    CertificateRepository,
    
  ],
})
export class CertificateModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
