import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { toTitleCase } from "../../constants/helpers";

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

export const NavBar = observer(() => {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const [loc, setLoc] = useState(location.pathname.split("/")[1]);

  const current = loc.replace("/", "");
  useEffect(() => {
    document.title =
      current.length > 0
        ? "HQ - " + toTitleCase(current)
        : "Mathiavelli Self-HQ";
  }, [current]);

  useEffect(() => {
    setLoc(location.pathname.split("/")[1]);
  }, [location]);

  const nav = allViewPaths.map(({ title, items, mainLink }) => {
    const allPaths = [...items, ...(mainLink ? [mainLink] : [])];
    const isSelected = allPaths.includes(current);

    return {
      title,
      selected: isSelected,
      ...(items.length > 1
        ? {
            children: items.map((item) => ({
              title:
                item.charAt(0).toUpperCase() + item.slice(1).replace("-", " "),
              link: `/${item}`,
            })),
          }
        : {
            link: `/${items[0]}`,
          }),
      ...(mainLink && items.length > 1 ? { link: `/${mainLink}` } : {}),
    };
  });

  return (
    <MyNavBar
      title="Mathiavelli Self-HQ"
      drawerOpen={open}
      setDrawerOpen={setOpen}
      profileUrl={"#"}
      paths={nav}
    />
  );
});
