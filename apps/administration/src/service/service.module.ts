import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	DatabaseModule, Service, ServiceSchema, ServiceRepository, RedisModule,
	UserEnrollment, UserEnrollmentSchema, UserEnrollmentRepository,
	Settings,
	Setting,
	SettingSchema,
	SettingRepository
} from '@app/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { instanceKeys } from '@app/common/config';

const serviceEntity = { name: Service.name, schema: ServiceSchema };
const userEnrollmentEntity = { name: UserEnrollment.name, schema: UserEnrollmentSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule, RedisModule,
		...createDatabaseModules([serviceEntity, userEnrollmentEntity, settingEntity], instanceKeys),
	],
	controllers: [ServiceController],
	providers: [ServiceService, ServiceRepository, UserEnrollmentRepository, SettingRepository, Settings],
})
export class ServiceModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
	return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
