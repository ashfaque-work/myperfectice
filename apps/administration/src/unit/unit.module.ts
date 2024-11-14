import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, Unit, UnitSchema, UnitRepository,
	Subject, SubjectRepository, SubjectSchema,
	Question, QuestionSchema, QuestionRepository
} from '@app/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { instanceKeys } from '@app/common/config';

const unitEntity = { name: Unit.name, schema: UnitSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		...createDatabaseModules([unitEntity, subjectEntity, questionEntity], instanceKeys),
	],
	controllers: [UnitController],
	providers: [UnitService, UnitRepository, SubjectRepository, QuestionRepository],
})
export class UnitModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
