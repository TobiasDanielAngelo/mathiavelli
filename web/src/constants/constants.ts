export const DAYS_OF_WEEK_CHOICES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const lowerFirstLetter = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export const isTouchDevice = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia("(pointer: coarse)").matches;

const getOrdinal = (n: number) => {
  let ord = "th";

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st";
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd";
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd";
  }
  return ord;
};

export const dayOfMonthSelections = Array.from(Array(33).keys()).map((s) => ({
  id: s + 1,
  name:
    s <= 27
      ? `${s + 1}${getOrdinal(s + 1)} Day of the Month`
      : s < 31
      ? `${s + 1}${getOrdinal(s + 1)} Day of the Month (or Earlier)`
      : s === 31
      ? "Last Day of the Month"
      : "Payout Date",
}));
