import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import { MySpeedDialProps } from '../constants/interfaces'

export const MySpeedDial = (props: { actions?: MySpeedDialProps[] }) => {
  const { actions } = props
  return (
    <SpeedDial
      hidden={
        !actions ||
        actions.filter((s) => (s.hidden ? !s.hidden : true)).length === 0
      }
      ariaLabel=""
      sx={{
        position: 'fixed',
        bottom: 25,
        right: 25,
        zIndex: 1,
      }}
      icon={<SpeedDialIcon />}>
      {actions?.map(
        (action) =>
          !action.hidden && (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ),
      )}
    </SpeedDial>
  )
}
