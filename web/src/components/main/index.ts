export type ViewPath = {
  title: string;
  items: string[];
  mainLink: string;
};

export const allViewPaths = [
  {
    title: "Dashboard",
    items: ["dashboard"],
    mainLink: "dashboard",
  },
  {
    title: "Finance",
    items: [
      "transactions",
      "accounts",
      "receivables",
      "payables",
      "categories",
    ],
    mainLink: "finance",
  },
  {
    title: "Properties",
    items: ["wishlist", "inventory", "inventory-types"],
  },
  {
    title: "Productivity",
    items: ["goals", "habits", "tasks", "events", "logs", "schedules", "tags"],
  },
  {
    title: "Personal",
    items: ["journals", "credentials", "platforms", "dreams", "documents"],
  },
  {
    title: "Travel",
    items: ["travel-plans", "bring-items", "travel-requirements"],
  },
  {
    title: "Career",
    items: ["jobs", "follow-ups"],
  },
  {
    title: "Health",
    items: ["meals", "weigh-ins", "body-fats", "waist-measure", "workouts"],
  },
  {
    title: "Support",
    items: [
      "notes",
      "tickets",
      "issue-comments",
      "issue-tags",
      "settings",
      "test",
    ],
  },
] as ViewPath[];
