import {
    DatabaseModule, Attempt, AttemptRepository, AttemptSchema,
} from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SqlAnalysisController } from "./sqlAnalysis.controller";
import { SqlAnalysisService } from "./sqlAnalysis.service";
import { instanceKeys } from "@app/common/config";

const attemptEntity = { name: Attempt.name, schema: AttemptSchema };

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    }), DatabaseModule,
    ...createDatabaseModules([
        attemptEntity,
    ], instanceKeys)],
    controllers: [SqlAnalysisController],
    providers: [
        SqlAnalysisService,
        AttemptRepository
    ],
})
export class SqlAnalysisModule { }


function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}