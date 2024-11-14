import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    Attempt,
    AttemptRepository,
    AttemptSchema,
    DatabaseModule, Instance, InstanceRepository, InstanceSchema, Program, ProgramRepository, ProgramSchema, RedisModule, Region, RegionRepository, RegionSchema, Setting, SettingRepository, SettingSchema, Subject, SubjectRepository, SubjectSchema,
    User,
    UserFav,
    UserFavRepository,
    UserFavSchema,
    UserSchema,
    UserSearch,
    UserSearchRepository,
    UserSearchSchema,
    UsersRepository
} from '@app/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { instanceKeys } from '@app/common/config';

const subjectEntity = { name: Subject.name, schema: SubjectSchema };
const instanceEntity = { name: Instance.name, schema: InstanceSchema };
const regionEntity = { name: Region.name, schema: RegionSchema };
const settingEntity = { name: Setting.name, schema: SettingSchema };
const programEntity = { name: Program.name, schema: ProgramSchema };
const userSearchEntity = { name: UserSearch.name, schema: UserSearchSchema };
const userFavEntity = { name: UserFav.name, schema: UserFavSchema };
const userEntity = { name: User.name, schema: UserSchema };
const attemptEntity = { name: Attempt.name, schema: AttemptSchema };

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        RedisModule,
        ...createDatabaseModules([subjectEntity, 
            instanceEntity, 
            regionEntity,
            settingEntity,
            programEntity,
            userSearchEntity,
            userFavEntity,
            userEntity,
            attemptEntity,
        ], instanceKeys),
    ],
    controllers: [RecruitmentController],
    providers: [RecruitmentService, 
        SubjectRepository, 
        InstanceRepository, 
        RegionRepository,
        SettingRepository,
        ProgramRepository,
        UserSearchRepository,
        UserFavRepository,
        UsersRepository,
        AttemptRepository,
    ],
})
export class RecruitmentModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
    return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
