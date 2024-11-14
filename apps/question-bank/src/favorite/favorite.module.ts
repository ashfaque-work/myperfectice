import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { instanceKeys } from '@app/common/config';
import {  Favorite, FavoriteSchema, Course, CourseRepository, CourseSchema, DatabaseModule, User, UserCourse, UserCourseRepository, UserCourseSchema, UserSchema, UsersRepository, PracticeSet, PracticeSetSchema, PracticeSetRepository, AwsS3Module } from '@app/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from '@app/common/database/repositories/favorite.repository';

const practiceSetEntity = { name: PracticeSet.name, schema: PracticeSetSchema };
const favoriteEntity = { name: Favorite.name, schema: FavoriteSchema };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AwsS3Module,
    ...createDatabaseModules([
      practiceSetEntity,
      favoriteEntity,
    ], instanceKeys),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService,
    PracticeSetRepository,
    FavoriteRepository,
    
  ],
})
export class FavoriteModule { }

function createDatabaseModules(entities: { name: string; schema: any }[], connectionNames: string[]): any[] {
  return connectionNames.map((conn) => DatabaseModule.forFeature(entities, conn));
}
