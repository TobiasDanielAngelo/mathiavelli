export const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const frequency = ["None", "Daily", "Weekly", "Monthly", "Yearly"];
export const priority = ["Low", "Medium", "High"];
export const status = ["Pending", "Bought", "Cancelled"];
export const authenticatorApps = [
  "None",
  "Google Authenticator",
  "Authy",
  "Microsoft Authenticator",
  "1Password",
  "Other",
];

export const jobStatuses = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Accepted",
];

export const jobSources = [
  "Walk-in",
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "JobStreet",
  "Referral",
  "Company Website",
  "Facebook",
  "Twitter / X",
  "Other",
];

export const workSetups = ["On-site", "Remote", "Hybrid"];
export const jobTypes = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Temporary",
];
export const followUpResponses = [
  "No Response",
  "Initial Follow-up",
  "Reminder Email",
  "Thank You Note",
  "Checking for Updates",
  "Interview Scheduled",
  "Got a Response",
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
