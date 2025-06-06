import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../blueprints/MyNavigation";

const sections = [
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
    title: "Productivity",
    items: ["goals", "tasks"],
  },
  {
    title: "Calendar",
    items: ["events", "tags"],
  },
  {
    title: "Personal",
    items: ["journals", "wishlist", "credentials", "platforms"],
  },
  {
    title: "Health",
    items: ["health"],
  },
];

export const NavBar = observer(
  (props: { open: boolean; setOpen?: Dispatch<SetStateAction<boolean>> }) => {
    const { open, setOpen } = props;

    const location = useLocation();
    const [loc, setLoc] = useState(location.pathname.split("/")[1]);

    const current = loc.replace("/", "");

    const nav = sections.map(({ title, items, mainLink }) => {
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
