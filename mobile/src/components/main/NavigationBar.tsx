import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { MyNavBar } from "../../blueprints/MyNavigation";
import { useLocation } from "react-router-native";
import { allViewPaths } from ".";

export const NavBar = observer(() => {
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const [loc, setLoc] = useState(location.pathname.split("/")[1]);

  const current = loc.replace("/", "");

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
