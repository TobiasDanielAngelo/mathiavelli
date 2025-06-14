import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddCardIcon from "@mui/icons-material/AddCard";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EventIcon from "@mui/icons-material/Event";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import MenuIcon from "@mui/icons-material/Menu";
import PaymentIcon from "@mui/icons-material/Payment";
import PrintIcon from "@mui/icons-material/Print";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { SvgIconProps } from "@mui/material/SvgIcon";

// 1. Map icons to names
const iconMap = {
  Edit: EditIcon,
  Delete: DeleteIcon,
  Save: SaveIcon,
  AddCard: AddCardIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  CloudUpload: CloudUploadIcon,
  Event: EventIcon,
  FilterAlt: FilterAltIcon,
  Inbox: InboxIcon,
  InsertChart: InsertChartIcon,
  Menu: MenuIcon,
  Payment: PaymentIcon,
  Print: PrintIcon,
  RestartAlt: RestartAltIcon,
  VisibilityOff: VisibilityOffIcon,
} as const;

// 2. Derive type from keys
export type IconName = keyof typeof iconMap;

// 3. Props with generic icon component + standard icon props
interface MyIconProps extends SvgIconProps {
  icon: IconName;
}

export const MyIcon: React.FC<MyIconProps> = ({ icon, ...props }) => {
  const IconComponent = iconMap[icon];
  return <IconComponent className="cursor-pointer text-gray-400" {...props} />;
};
