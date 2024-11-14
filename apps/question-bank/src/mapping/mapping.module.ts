import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { AwsS3Module, DatabaseModule, Mapping, MappingRepository, MappingSchema } from '@app/common';

const mappingEntity = { name: Mapping.name, schema: MappingSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    ...createDatabaseModules([
      mappingEntity,
    ], instanceKeys),
  ],
  controllers: [MappingController],
  providers: [MappingService,
    MappingRepository,
  ],
})
export class MappingModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
