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

const drawerWidth = 240;

export const ResponsiveDrawer = observer(
  (props: { open?: boolean; setOpen?: Dispatch<SetStateAction<boolean>> }) => {
    const { open, setOpen } = props;

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
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            {/* <List>
            {['References', 'Records', 'Reports'].map((s, ind) => (
              <ListItem key={ind} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {ind % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={s} secondary={''} />
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
            <List>
              {["Logout"].map((s, ind) => (
                <ListItem key={ind} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      {ind % 2 === 0 ? <InboxIcon /> : <MailIcon />}
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
