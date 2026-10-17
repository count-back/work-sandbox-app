// In-memory collections keyed by numeric id. Each collection has its own id sequence.

export function createCollection() {
  const items = new Map();
  let next = 1;
  return {
    list: () => [...items.values()],
    get: id => items.get(id),
    add(fields) {
      const item = { id: next++, ...fields };
      items.set(item.id, item);
      return item;
    },
    update(id, fields) {
      const cur = items.get(id);
      if (!cur) return undefined;
      const item = { ...cur, ...fields, id };
      items.set(id, item);
      return item;
    },
    remove: id => items.delete(id),
  };
}
