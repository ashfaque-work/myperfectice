import { Module } from '@nestjs/common';
import { WhiteboardService } from './whiteboard.service';
import { RedisModule } from '@app/common/modules';
import { DatabaseModule, WhiteboardLog, WhiteboardLogRepository, WhiteboardLogSchema } from '@app/common/database';
import { instanceKeys } from '@app/common/config';
import { HttpModule } from '@nestjs/axios';
import { SocketClientModule } from '@app/common/socket';

const whiteboardLogEntity = { name: WhiteboardLog.name, schema: WhiteboardLogSchema };

@Module({
  imports: [
    RedisModule, HttpModule, SocketClientModule,
    DatabaseModule,
    ...createDatabaseModules([
      whiteboardLogEntity
    ], instanceKeys),
  ],
  providers: [WhiteboardService, WhiteboardLogRepository],
  exports: [WhiteboardService],
})
export class WhiteboardModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}