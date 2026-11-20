const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** `best_travel_months` uses 0-based month indexes (0 = Jan). */
const getMonthIndexes = (months) =>
  [
    ...new Set(
      (Array.isArray(months) ? months : [])
        .map(Number)
        .filter((month) => Number.isInteger(month) && month >= 0 && month < 12),
    ),
  ].sort((a, b) => a - b);

/** True when the server says so, or the current month is a best month. */
export const isBestTimeNow = (destination, now = new Date()) => {
  if (typeof destination?.is_now_best_time === "boolean") {
    return destination.is_now_best_time;
  }

  return getMonthIndexes(destination?.best_travel_months).includes(
    now.getMonth(),
  );
};

/**
 * Longest contiguous run of best months, wrapping over the year end:
 * [10, 11, 0, 1] → "Nov–Feb". Returns "" when unknown or year-round.
 */
export const formatBestSeason = (months) => {
  const indexes = getMonthIndexes(months);
  if (!indexes.length || indexes.length === 12) return "";

  const ranges = [];
  indexes.forEach((month) => {
    const last = ranges.at(-1);
    if (last && month === last.end + 1) last.end = month;
    else ranges.push({ start: month, end: month });
  });

  if (ranges.length > 1 && ranges[0].start === 0 && ranges.at(-1).end === 11) {
    const first = ranges.shift();
    ranges.at(-1).end = first.end + 12;
  }

  const longest = ranges.reduce((best, range) =>
    range.end - range.start > best.end - best.start ? range : best,
  );
  const start = MONTH_LABELS[longest.start % 12];
  const end = MONTH_LABELS[longest.end % 12];

  return start === end ? start : `${start}–${end}`;
};

export const formatStayRange = (destination) => {
  const min = Number(destination?.min_stay_days);
  const max = Number(destination?.max_stay_days);

  if (min > 0 && max > 0) return min === max ? `${min} days` : `${min}–${max} days`;
  if (min > 0 || max > 0) return `${min || max} days`;
  return "";
};
