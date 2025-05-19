import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../blueprints/MyNavBar";
import { toTitleCase } from "../constants/helpers";

export const NavBar = observer(
  (props: { open: boolean; setOpen?: Dispatch<SetStateAction<boolean>> }) => {
    const { open, setOpen } = props;

    const location = useLocation();
    const [loc, setLoc] = useState(location.pathname.split("/")[1]);

    return (
      <MyNavBar
        title="Mathiavelli Self-HQ"
        drawerOpen={open}
        setDrawerOpen={setOpen}
        location={loc}
        setLocation={setLoc}
        profileUrl={"#"}
        paths={["/journals", "/finances", "/events", "/goals"].map((s) => ({
          title: toTitleCase(s),
          link: s,
          selected: s.replace("/", "") === loc.replace("/", ""),
        }))}
      />
    );
  }
);
