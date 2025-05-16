import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { MySpeedDialProps } from "../constants/interfaces";

export const MySpeedDial = (props: {
  actions?: MySpeedDialProps[];
  onClick?: () => void;
  title?: string;
}) => {
  const { actions, onClick, title } = props;
  return (
    <SpeedDial
      title={title}
      onClick={onClick}
      hidden={
        !actions ||
        actions.filter((s) => (s.hidden ? !s.hidden : true)).length === 0
      }
      ariaLabel=""
      sx={{
        position: "fixed",
        bottom: 25,
        right: 25,
        zIndex: 1,
      }}
      icon={<SpeedDialIcon />}
    >
      {actions?.map(
        (action) =>
          !action.hidden && (
            <SpeedDialAction
              tooltipTitle={action.name}
              key={action.name}
              icon={action.icon}
              onClick={action.onClick}
            />
          )
      )}
    </SpeedDial>
  );
};
