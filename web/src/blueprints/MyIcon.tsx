import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Save from "@mui/icons-material/Save";
import AddCard from "@mui/icons-material/AddCard";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Event from "@mui/icons-material/Event";
import FilterAlt from "@mui/icons-material/FilterAlt";
import Inbox from "@mui/icons-material/MoveToInbox";
import InsertChart from "@mui/icons-material/InsertChart";
import Menu from "@mui/icons-material/Menu";
import Payment from "@mui/icons-material/Payment";
import Print from "@mui/icons-material/Print";
import RestartAlt from "@mui/icons-material/RestartAlt";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilterListAlt from "@mui/icons-material/FilterListAlt";
import NoteAdd from "@mui/icons-material/NoteAdd";
import PieChart from "@mui/icons-material/PieChart";
import ViewList from "@mui/icons-material/ViewList";
import TableChart from "@mui/icons-material/TableChart";
import Timeline from "@mui/icons-material/Timeline";
import Padding from "@mui/icons-material/Padding";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import BarChart from "@mui/icons-material/BarChart";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Sort from "@mui/icons-material/Sort";
import Settings from "@mui/icons-material/Settings";
import { SvgIconProps } from "@mui/material/SvgIcon";

// 1. Map icons to names
const iconMap = {
  Edit,
  Delete,
  Save,
  AddCard,
  Check,
  Close,
  CloudUpload,
  Event,
  FilterAlt,
  Inbox,
  InsertChart,
  Menu,
  Payment,
  Print,
  RestartAlt,
  VisibilityOff,
  FilterListAlt,
  ViewList,
  NoteAdd,
  PieChart,
  Timeline,
  TableChart,
  Padding,
  BarChart,
  ExpandMore,
  ExpandLess,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Settings,
  Sort,
} as const;

// 2. Derive type from keys
export type IconName = keyof typeof iconMap;

// 3. Props with generic icon component + standard icon props
interface MyIconProps extends SvgIconProps {
  icon: IconName;
  label?: string;
}

export const MyIcon: React.FC<MyIconProps> = ({ icon, label, ...props }) => {
  const IconComponent = iconMap[icon];

  return (
    <div className="flex flex-col items-center">
      <IconComponent className="cursor-pointer text-gray-400" {...props} />
      <div className="text-xs text-gray-500 font-bold">{label}</div>
    </div>
  );
};
