import moment from "moment";
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

export const duration = (time) => {
  const duration = moment.duration(moment().diff(moment(time)));

  const years = duration.years();
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (years > 0) {
    return `${years}y ago`;
  } else if (months > 0) {
    return `${months}mo ago`;
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return `${seconds}s ago`;
  }
};
