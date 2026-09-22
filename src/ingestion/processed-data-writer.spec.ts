import { Column, DataSource, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { buildEntity } from '../common/build-entity';
import { createTestDataSource } from '../../test/test-data-source';
import { ProcessedDataWriter } from './processed-data-writer';

@Entity()
class Shelf {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  label!: string;
}

@Entity()
class Widget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  colour!: string;

  @ManyToOne(() => Shelf, { nullable: false })
  shelf!: Shelf;
}

interface WorkshopData {
  errors?: string[];
  shelves?: Shelf[];
  widgets?: Widget[];
}

describe('ProcessedDataWriter', () => {
  let dataSource: DataSource;
  let writer: ProcessedDataWriter<WorkshopData>;

  beforeEach(async () => {
    dataSource = await createTestDataSource([Shelf, Widget]);
    writer = new ProcessedDataWriter<WorkshopData>(dataSource, [
      { key: 'shelves', entity: Shelf },
      { key: 'widgets', entity: Widget },
    ]);
  });

  afterEach(() => dataSource.destroy());

  it('writes each key in order and reports how many rows it wrote', async () => {
    const topShelf = buildEntity(Shelf, { label: 'top' });
    const widgets = [
      buildEntity(Widget, { name: 'gear', colour: 'red', shelf: topShelf }),
      buildEntity(Widget, { name: 'cog', colour: 'blue', shelf: topShelf }),
    ];

    const written = await writer.write({ shelves: [topShelf], widgets });

    expect(written).toEqual({ shelves: 1, widgets: 2 });
    const savedWidgets = await dataSource.getRepository(Widget).find({ relations: { shelf: true } });
    expect(savedWidgets.map((widget) => widget.shelf.label)).toEqual(['top', 'top']);
  });

  it('skips keys that are absent', async () => {
    const written = await writer.write({ shelves: [buildEntity(Shelf, { label: 'only' })] });

    expect(written).toEqual({ shelves: 1 });
  });

  it('names the key and row that failed and rolls back everything', async () => {
    const topShelf = buildEntity(Shelf, { label: 'top' });
    const widgets = [
      buildEntity(Widget, { name: 'gear', colour: 'red', shelf: topShelf }),
      buildEntity(Widget, { name: 'no colour', shelf: topShelf }),
    ];

    await expect(writer.write({ shelves: [topShelf], widgets })).rejects.toThrow(
      /^widgets row 2: .*NOT NULL constraint failed: widget\.colour$/,
    );
    expect(await dataSource.getRepository(Shelf).count()).toBe(0);
    expect(await dataSource.getRepository(Widget).count()).toBe(0);
  });
});
