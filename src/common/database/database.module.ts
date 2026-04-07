import { Module, DynamicModule, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ENV_NAMESPACES } from '../../config';

@Module({})
export default class DatabaseModule {
  private static readonly logger: Logger = new Logger();

  public static getNoSqlConnectionString(
    config: ConfigService,
  ): string | undefined {
    const connectionURL = config.get<string>(`${ENV_NAMESPACES.DATABASE}.uri`);
    if (!connectionURL) {
      this.logger.error('Invalid DB URL');
    }
    return connectionURL;
  }

  public static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            uri: DatabaseModule.getNoSqlConnectionString(config),
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
