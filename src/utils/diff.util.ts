export function computeDiff(before: any, after: any) {
  if (!before || !after) return null;

  const diff: Record<string, any> = {};

  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      diff[key] = {
        before: before[key],
        after: after[key]
      };
    }
  }

  return Object.keys(diff).length ? diff : null;
}
