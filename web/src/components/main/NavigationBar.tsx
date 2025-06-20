import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { toTitleCase } from "../../constants/helpers";
import { StateSetter } from "../../constants/interfaces";

export type ViewPath = {
  title: string;
  items: string[];
  mainLink: string;
};

export const allViewPaths = [
  {
    title: "Finance",
    items: [
      "transactions",
      "accounts",
      "receivables",
      "payables",
      "categories",
      "wishlist",
      "personal-items",
      "inventory-categories",
    ],
    mainLink: "finance",
  },
  {
    title: "Productivity",
    items: [
      "goals",
      "habits",
      "tasks",
      "events",
      "habit-logs",
      "schedules",
      "tags",
    ],
  },
  {
    title: "Personal",
    items: ["journals", "credentials", "platforms"],
  },
  {
    title: "Career",
    items: ["jobs", "follow-ups"],
  },
  {
    title: "Health",
    items: ["meals", "weigh-ins", "body-fats", "waist-measure", "workouts"],
  },
] as ViewPath[];

export const NavBar = observer(
  (props: { open: boolean; setOpen?: StateSetter<boolean> }) => {
    const { open, setOpen } = props;

    const location = useLocation();
    const [loc, setLoc] = useState(location.pathname.split("/")[1]);

    const current = loc.replace("/", "");
    useEffect(() => {
      document.title =
        current.length > 0
          ? "HQ - " + toTitleCase(current)
          : "Mathiavelli Self-HQ";
    }, [current]);

    const nav = allViewPaths.map(({ title, items, mainLink }) => {
      const allPaths = [...items, ...(mainLink ? [mainLink] : [])];
      const isSelected = allPaths.includes(current);

      return {
        title,
        selected: isSelected,
        ...(items.length > 1
          ? {
              children: items.map((item) => ({
                title: item.charAt(0).toUpperCase() + item.slice(1),
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
        location={loc}
        setLocation={setLoc}
        profileUrl={"#"}
        paths={nav}
      />
    );
  }
);
