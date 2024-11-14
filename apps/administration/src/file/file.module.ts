import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, File, FileSchema, FileRepository,
} from '@app/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { instanceKeys } from '@app/common/config';
import { AwsS3Module } from '@app/common/components/aws/s3.module';

const fileEntity = { name: File.name, schema: FileSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		...createDatabaseModules([fileEntity], instanceKeys),
		AwsS3Module
	],
	controllers: [FileController],
	providers: [FileService, FileRepository],
})
export class FileModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
