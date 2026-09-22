export interface PersistenceStep<TData> {
  key: Exclude<keyof TData, 'errors'> & string;
  entity: Function;
}
