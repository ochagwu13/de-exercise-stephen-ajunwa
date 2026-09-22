import { Inject, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { buildDataSource } from './data-source';
import { DATA_SOURCE } from './database.tokens';

@Injectable()
class DataSourceShutdown implements OnModuleDestroy {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onModuleDestroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

@Module({
  providers: [
    {
      provide: DATA_SOURCE,
      useFactory: async (): Promise<DataSource> => {
        const dataSource = buildDataSource({ inMemory: process.env.NODE_ENV === 'test' });
        return dataSource.initialize();
      },
    },
    DataSourceShutdown,
  ],
  exports: [DATA_SOURCE],
})
export class DatabaseModule {}
