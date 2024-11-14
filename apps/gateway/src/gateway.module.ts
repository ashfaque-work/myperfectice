import { AuthCommonModule } from "@app/common/auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { CourseModule } from "./course/course.module";
import { ClassroomModule } from "./classroom/classroom.module";
import { AssessmentModule } from "./assessment/assessment.module";
import { AdministrationModule } from "./administration/administration.module";
import { QuestionBankModule } from "./question-bank/question-bank.module";
import { AttemptModule } from "./attempt/attempt.module";
import { RedisModule, SocketModule } from "@app/common";
import { EcommerceModule } from "./ecommerce/ecommerce.module";
import { NotifyModule } from "./notify/notify.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SocketModule, RedisModule, AuthCommonModule,
    AuthModule, NotifyModule, CourseModule, ClassroomModule, AssessmentModule, AdministrationModule,
    QuestionBankModule, AttemptModule, EcommerceModule
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule { }
