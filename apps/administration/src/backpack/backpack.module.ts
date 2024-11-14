import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, Backpack, BackpackSchema, BackpackRepository,
} from '@app/common';
import { BackpackController } from './backpack.controller';
import { instanceKeys } from '@app/common/config';
import { BackpackService } from './backpack.service';

const backpackEntity = { name: Backpack.name, schema: BackpackSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		...createDatabaseModules([backpackEntity], instanceKeys),
	],
	controllers: [BackpackController],
	providers: [BackpackService, BackpackRepository],
})
export class BackpackModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
