import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule, Program, ProgramSchema, ProgramRepository,
  Location, LocationRepository, LocationSchema,
  Subject, SubjectRepository, SubjectSchema
} from '@app/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { instanceKeys } from '@app/common/config';

const locationEntity = { name: Location.name, schema: LocationSchema };
const programEntity = { name: Program.name, schema: ProgramSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([locationEntity, programEntity, subjectEntity], instanceKeys),
  ],
  controllers: [ProgramController],
  providers: [ProgramService, ProgramRepository, LocationRepository, SubjectRepository],
})
export class ProgramModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
