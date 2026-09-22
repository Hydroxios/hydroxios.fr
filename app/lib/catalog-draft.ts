// Object key order is irrelevant; array order and unknown fields are preserved.
export function catalogFingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(catalogFingerprint).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${catalogFingerprint(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
