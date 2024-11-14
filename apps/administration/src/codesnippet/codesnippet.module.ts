import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, Codesnippet, CodesnippetSchema, CodesnippetRepository
} from '@app/common';
import { CodesnippetService } from './codesnippet.service';
import { CodesnippetController } from './codesnippet.controller';
import { instanceKeys } from '@app/common/config';

const codesnippetEntity = { name: Codesnippet.name, schema: CodesnippetSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		...createDatabaseModules([codesnippetEntity], instanceKeys),
	],
	controllers: [CodesnippetController],
	providers: [CodesnippetService, CodesnippetRepository],
})
export class CodesnippetModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
