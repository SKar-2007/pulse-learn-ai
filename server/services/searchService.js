export function buildSearchQuery(query) {
  return query?.trim?.() || '';
}

export function transformSearchResult(item, type) {
  return { ...item, type };
}
