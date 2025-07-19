import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { useNavigate } from "react-router-native";
import { useStore } from "../api/Store";
import { useIsUnhoverable } from "../constants/hooks";
import { Page, StateSetter } from "../constants/interfaces";
import MyDrawer from "./MyDrawer";
import { MyIcon } from "./MyIcon";

const drawerWidth = 240;

export const ResponsiveDrawer = observer(
  (props: {
    open: boolean;
    setOpen: StateSetter<boolean>;
    paths?: Page[];
    onPress: () => void;
  }) => {
    const { open, setOpen, onPress, paths } = props;
    const navigate = useNavigate();
    const { userStore } = useStore();
    return (
      <MyDrawer
        isOpen={open}
        onClose={() => setOpen?.(false)}
        // icon={<MyIcon label="Bars" icon="bars" onPress={onPress} />}
      >
        <Button title="Close Drawer" onPress={() => setOpen(false)} />
      </MyDrawer>
    );
  }
);

const NavLink = ({ page }: { page: Page }) => {
  const isTouch = useIsUnhoverable();
  return isTouch ? <></> : <View></View>;
};

export const MyNavBar = observer(
  (props: {
    title?: string;
    profileUrl?: string;
    paths?: Page[];
    drawerOpen: boolean;
    setDrawerOpen: StateSetter<boolean>;
  }) => {
    const { title, profileUrl, paths, drawerOpen, setDrawerOpen } = props;

    const { settingStore } = useStore();
    const navigate = useNavigate();

    const onPressLogout = async () => {
      navigate("/login");
    };

    const leafPages = paths?.flatMap((p) => {
      const leaves = p.children?.length
        ? p.children.filter((c) => !c.children?.length)
        : [];

      if (p.link) {
        leaves.push({
          title: p.title,
          link: p.link,
        });
      }
      return leaves.length ? leaves : [p];
    });

    const onPress = () => {
      setDrawerOpen(true);
    };

    return (
      <ResponsiveDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        paths={leafPages}
        onPress={onPress}
      />
    );
  }
);
