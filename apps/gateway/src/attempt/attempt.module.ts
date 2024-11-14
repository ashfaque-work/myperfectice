import { AttemptClientModule } from "@app/common/grpc-clients/attempt";
import { Module } from "@nestjs/common";
import { AttemptService } from "./attempt.service";
import { AttemptController } from "./attempt.controller";
import { StudentController } from "./student/student.controller";
import { StudentService } from "./student/student.service";
import { AuthCommonModule } from "@app/common/auth/auth.module";
import { AuthenticationGuard } from "@app/common/auth";
import { AnalysisController } from "./analysis/analysis.controller";
import { AnalysisService } from "./analysis/analysis.service";
import { SqlAnalysisController } from "./sqlAnalysis/sqlAnalysis.controller";
import { SqlAnalysisService } from "./sqlAnalysis/sqlAnalysis.service";

@Module({
    imports: [AttemptClientModule, AuthCommonModule],
    controllers: [AttemptController, StudentController, AnalysisController, SqlAnalysisController],
    providers: [AttemptService, StudentService, AuthenticationGuard, AnalysisService, SqlAnalysisService]
})
export class AttemptModule { }