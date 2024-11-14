import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { DatabaseModule, Setting, SettingRepository, SettingSchema } from "../database";
import { RedisCaching } from "../services/redisCaching.service";
import { instanceKeys } from "../config";
import { RedisClient } from "../services/redisClient.service";

const settingEntity = { name: Setting.name, schema: SettingSchema };

@Module({
    imports: [
        CacheModule.register({
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    url: configService.get('REDIS_URI'),
                    ttl: 5000
                }),
            }),
            isGlobal: true,
            inject: [ConfigService],
        }),
        DatabaseModule,
        ...createDatabaseModules([settingEntity], instanceKeys),
    ],
    providers: [RedisCaching, SettingRepository, RedisClient],
    exports: [RedisCaching],
})

export class RedisModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}