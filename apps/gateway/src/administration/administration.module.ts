import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { AdministrationClientModule } from '@app/common/grpc-clients/administration';
import { ProgramController } from './program/program.controller';
import { SettingController } from './setting/setting.controller';
import { SubjectController } from './subject/subject.controller';
import { TopicController } from './topic/topic.controller';
import { UnitController } from './unit/unit.controller';
import { ContentController } from './content/content.controller';
import { FileController } from './file/file.controller';
import { ProgramService } from './program/program.service';
import { SettingService } from './setting/setting.service';
import { SubjectService } from './subject/subject.service';
import { TopicService } from './topic/topic.service';
import { UnitService } from './unit/unit.service';
import { ContentService } from './content/content.service';
import { FileService } from './file/file.service';
import { AwsS3Module } from '@app/common/components/aws/s3.module';
import { CountryController } from './country/country.controller';
import { CountryService } from './country/country.service';
import { ServiceController } from './service/service.controller';
import { ServiceService } from './service/service.service';
import { BackpackController } from './backpack/backpack.controller';
import { BackpackService } from './backpack/backpack.service';
import { AuthCommonModule } from '@app/common/auth/auth.module';
import { AuthenticationGuard } from '@app/common/auth';
import { CodesnippetController } from './codesnippet/codesnippet.controller';
import { CodesnippetService } from './codesnippet/codesnippet.service';
import { HostRateController } from './platform/hostRate/hostRate.controller';
import { HostRateService } from './platform/hostRate/hostRate.service';
import { PlatformByNumbersController } from './platform/platformByNumbers/platformByNumbers.controller';
import { PlatformByNumbersService } from './platform/platformByNumbers/platformByNumbers.service';
import { ToolController } from './platform/tool/tool.controller';
import { ToolService } from './platform/tool/tool.service';
import { BoardInfinityController } from './provider/boardInfinity/boardInfinity.controller';
import { BoardInfinityService } from './provider/boardInfinity/boardInfinity.service';
import { NiitController } from './provider/Niit/niit.controller';
import { NiitService } from './provider/Niit/niit.service';
import { RecruitmentController } from './recruitment/recruitment.controller';
import { RecruitmentService } from './recruitment/recruitment.service';

@Module({
  imports: [AdministrationClientModule, AwsS3Module, AuthCommonModule],
  controllers: [
    AdministrationController, ProgramController, SettingController,
    SubjectController, TopicController, UnitController, ContentController,
    FileController, CountryController, ServiceController, BackpackController,
    CodesnippetController, HostRateController, PlatformByNumbersController,
    ToolController, BoardInfinityController, NiitController, RecruitmentController
  ],
  providers: [
    AdministrationService, SubjectService, SettingService, ProgramService,
    TopicService, UnitService, ContentService, FileService, CountryService,
    ServiceService, BackpackService, AuthenticationGuard, CodesnippetService,
    HostRateService, PlatformByNumbersService, ToolService, BoardInfinityService,
    NiitService, RecruitmentService
  ],
})
export class AdministrationModule { } 
