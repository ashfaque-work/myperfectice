import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, Content, ContentSchema, ContentRepository,
	Classroom, ClassroomSchema, ClassroomRepository,
	User, UserSchema, UsersRepository,
	Topic, TopicSchema, TopicRepository,
	Subject, SubjectSchema, SubjectRepository
} from '@app/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { instanceKeys } from '@app/common/config';
import { AwsS3Module } from '@app/common/components/aws/s3.module';

const contentEntity = { name: Content.name, schema: ContentSchema };
const classroomEntity = { name: Classroom.name, schema: ClassroomSchema };
const userEntity = { name: User.name, schema: UserSchema };
const topicEntity = { name: Topic.name, schema: TopicSchema };
const subjectEntity = { name: Subject.name, schema: SubjectSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		...createDatabaseModules([
			contentEntity, classroomEntity,
			userEntity, topicEntity, subjectEntity
		], instanceKeys),
		AwsS3Module
	],
	controllers: [ContentController],
	providers: [ContentService, ContentRepository, ClassroomRepository, UsersRepository, TopicRepository, SubjectRepository],
})
export class ContentModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
