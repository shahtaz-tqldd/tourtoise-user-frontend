const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatMonths = (months) => {
  if (!months?.length) return "N/A";
  if (months.length === 12) return "Anytime";

  const monthIndexes = [
    ...new Set(
      months
        .map((month) => Number(month))
        .filter((month) => Number.isInteger(month) && month >= 0 && month < 12),
    ),
  ].sort((a, b) => a - b);

  if (!monthIndexes.length) return "N/A";

  const ranges = [];
  let rangeStart = monthIndexes[0];
  let rangeEnd = monthIndexes[0];

  for (const month of monthIndexes.slice(1)) {
    if (month === rangeEnd + 1) {
      rangeEnd = month;
      continue;
    }

    ranges.push([rangeStart, rangeEnd]);
    rangeStart = month;
    rangeEnd = month;
  }

  ranges.push([rangeStart, rangeEnd]);

  return ranges
    .map(([start, end]) =>
      start === end
        ? monthLabels[start]
        : `${monthLabels[start]} - ${monthLabels[end]}`,
    )
    .join(", ");
};

export const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "Not set";

  // Parse YYYY-MM-DD inputs in local time context
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const monthFormat = new Intl.DateTimeFormat("en", { month: "short" });
  const dayFormat = new Intl.DateTimeFormat("en", { day: "numeric" });
  const yearFormat = new Intl.DateTimeFormat("en", { year: "numeric" });

  const startMonth = monthFormat.format(start);
  const startDay = dayFormat.format(start);
  const startYear = yearFormat.format(start);

  const endMonth = monthFormat.format(end);
  const endDay = dayFormat.format(end);
  const endYear = yearFormat.format(end);

  // Same day
  if (startDate === endDate) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  // Same year
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  // Different years
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
};

export const formatUpdatedAt = (value) => {
  if (!value) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const UNITS = [
  { ms: 365.25 * 24 * 60 * 60 * 1000, label: "y" },
  { ms: 30.44 * 24 * 60 * 60 * 1000, label: "mo" },
  { ms: 24 * 60 * 60 * 1000, label: "d" },
  { ms: 60 * 60 * 1000, label: "h" },
  { ms: 60 * 1000, label: "m" },
  { ms: 1000, label: "s" },
];

export const duration = (time) => {
  let remaining = Date.now() - new Date(time).getTime();

  if (!Number.isFinite(remaining) || remaining < 0) return "0s ago";

  for (const unit of UNITS) {
    const value = Math.floor(remaining / unit.ms);
    if (value > 0) return `${value}${unit.label} ago`;
    remaining %= unit.ms;
  }

  return "0s ago";
};
