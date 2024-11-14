import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule, Question, QuestionRepository, QuestionSchema,
  AttemptDetail, AttemptDetailRepository, AttemptDetailSchema,
  Unit, UnitRepository, UnitSchema,
  Topic, TopicSchema, TopicRepository
} from '@app/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { instanceKeys } from '@app/common/config';

const topicEntity = { name: Topic.name, schema: TopicSchema };
const questionEntity = { name: Question.name, schema: QuestionSchema };
const attemptDetailsEntity = { name: AttemptDetail.name, schema: AttemptDetailSchema };
const unitEntity = { name: Unit.name, schema: UnitSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ...createDatabaseModules([topicEntity, questionEntity, attemptDetailsEntity, unitEntity], instanceKeys),
  ],
  controllers: [TopicController],
  providers: [TopicService, TopicRepository, QuestionRepository, AttemptDetailRepository, UnitRepository],
})
export class TopicModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}