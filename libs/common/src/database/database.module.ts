import { ModelDefinition, MongooseModule } from "@nestjs/mongoose";
import { Logger, Module } from "@nestjs/common";
import { config, dbConfig } from "../config";


@Module({
  imports: [
    ...createMongooseModules(config['greenTDBCon'] ? [config['greenTDBCon'], ...dbConfig] : dbConfig),
  ],
})

export class DatabaseModule {
  static forFeature(models: ModelDefinition[], connectionName: string) {
    console.log(`Instance Key in Database Module: ${connectionName}`);
    return MongooseModule.forFeature(models, connectionName);
  }
}

function createMongooseModules(conns: { instancekey: string, uri: string }[]): any[] {
  return conns.map(conn => MongooseModule.forRootAsync({
    connectionName: conn.instancekey,
    useFactory: async () => ({
      uri: conn.uri,
    }),
  }));
} 