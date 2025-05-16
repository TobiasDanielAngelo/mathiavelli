import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction, useState } from "react";
import { useLocation } from "react-router-dom";
import { MyNavBar } from "../blueprints/MyNavBar";
import { toTitleCase } from "../constants/helpers";

export const NavBar = observer(
  (props: { setOpen?: Dispatch<SetStateAction<boolean>> }) => {
    const { setOpen } = props;

    const location = useLocation();
    const [loc, setLoc] = useState(location.pathname.split("/")[1]);

    return (
      <MyNavBar
        title="Mathiavelli Self-HQ"
        setDrawerOpen={setOpen}
        location={loc}
        setLocation={setLoc}
        profileUrl={"#"}
        paths={["/journals", "/finances"].map((s) => ({
          title: toTitleCase(s),
          link: s,
          selected: s === loc,
        }))}
      />
    );
  }
);
