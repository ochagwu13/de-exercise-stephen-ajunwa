import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { createTestDataSource } from '../../test/test-data-source';
import { DEV_DATABASE_PATH, buildDataSource } from './data-source';

@Entity()
class Widget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}

describe('buildDataSource', () => {
  it('builds the schema from the entities it is given, in memory', async () => {
    const dataSource = await createTestDataSource([Widget]);

    const tableNames = dataSource.entityMetadatas.map((metadata) => metadata.tableName);
    expect(tableNames).toEqual(['widget']);
    await dataSource.getRepository(Widget).save({ name: 'gear' });
    expect(await dataSource.getRepository(Widget).count()).toBe(1);

    await dataSource.destroy();
  });

  it('points the file database under data/', () => {
    const dataSource = buildDataSource({ inMemory: false });

    expect(dataSource.options.database).toBe(DEV_DATABASE_PATH);
    expect(DEV_DATABASE_PATH.endsWith('/data/exercise.sqlite')).toBe(true);
  });
});
