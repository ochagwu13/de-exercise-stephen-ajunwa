export function buildEntity<T extends object>(EntityClass: new () => T, fields: Partial<T>): T {
  return Object.assign(new EntityClass(), fields);
}
