const customersSynced = new Set<string>();

export const customerStore = {
  markSynced: (id: string) => customersSynced.add(id),
  isSyncedOverride: (id: string) => customersSynced.has(id),
};
