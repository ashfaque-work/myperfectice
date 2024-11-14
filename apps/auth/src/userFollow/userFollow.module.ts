import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserFollowController } from "./userFollow.controller";
import { UserFollowService } from "./userFollow.service";
import { DatabaseModule, User, UserFollow, UserFollowRepository, UserFollowSchema, UserSchema, UsersRepository } from "@app/common";
import { instanceKeys } from "@app/common/config";

const userFollowEntity = { name: UserFollow.name, schema: UserFollowSchema };
const userEntity = { name: User.name, schema: UserSchema };

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule,
        ...createDatabaseModules([userFollowEntity, userEntity], instanceKeys)
    ],
    controllers: [UserFollowController],
    providers: [UserFollowService, UserFollowRepository, UsersRepository]
})
export class UserFollowModule {}

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
  }