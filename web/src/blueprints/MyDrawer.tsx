import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { IconButton, Toolbar } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction } from "react";
import { useKeyPress } from "../constants/hooks";
import { Page } from "../constants/interfaces";
import { useNavigate } from "react-router-dom";
import { useStore } from "../api/Store";

const drawerWidth = 240;

export const ResponsiveDrawer = observer(
  (props: {
    open?: boolean;
    setOpen?: Dispatch<SetStateAction<boolean>>;
    paths?: Page[];
    location?: string;
    setLocation?: Dispatch<SetStateAction<string>>;
  }) => {
    const { open, setOpen, paths, location, setLocation } = props;
    const navigate = useNavigate();
    const { userStore } = useStore();

    useKeyPress(["q", "Shift"], () => setOpen && setOpen(false));

    return (
      <div style={{ display: "flex" }}>
        <Drawer
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
          open={open}
          onClose={setOpen && (() => setOpen(false))}
        >
          <div className="dark:bg-gray-900 dark:text-gray-400 h-full">
            <Toolbar />
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setLocation && setLocation("/");
                    navigate("/");
                    setOpen && setOpen(false);
                  }}
                >
                  <ListItemIcon>
                    <InboxIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={"Dashboard"} secondary={""} />
                </ListItemButton>
              </ListItem>
              {paths?.map((s, ind) => (
                <ListItem key={ind} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setLocation && s.link && setLocation(s.link);
                      navigate(s?.link ?? "/");
                      setOpen && setOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      {ind % 2 === 0 ? (
                        <InboxIcon color="primary" />
                      ) : (
                        <MailIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={s.title} secondary={""} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <List>
              {["Logout"].map((s, ind) => (
                <ListItem key={ind} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setLocation && setLocation("/");
                      userStore.logoutUser();
                      navigate("/login");
                      setOpen && setOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      {ind % 2 === 0 ? (
                        <InboxIcon color="primary" />
                      ) : (
                        <MailIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={s} secondary={""} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </div>
    );
  }
);
