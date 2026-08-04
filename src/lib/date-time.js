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
