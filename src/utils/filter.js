function collectText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (typeof value === "object") {
    return Object.values(value).map(collectText).join(" ");
  }
  return String(value);
}

export function filterBySearch(items, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) =>
    collectText(item).toLocaleLowerCase().includes(normalizedQuery),
  );
}