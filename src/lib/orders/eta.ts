export function hoursFromProducts(
  rows: { preparation_time_hours?: number | null; delivery_time_hours?: number | null }[],
): number {
  let max = 0;
  for (const row of rows) {
    const prep = Math.max(0, row.preparation_time_hours ?? 0);
    const delivery = Math.max(0, row.delivery_time_hours ?? 0);
    max = Math.max(max, prep + delivery);
  }
  return max > 0 ? max : 4;
}

export function promisedAtFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

/** Vercel production marker. */
