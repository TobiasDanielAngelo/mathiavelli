import CloseIcon from "@mui/icons-material/Close";
import { Dialog } from "@mui/material";
import { useClickAway } from "@uidotdev/usehooks";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { useKeyPress } from "../constants/hooks";

export const MyModal = (
  props: PropsWithChildren<{
    isVisible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    fullWidth?: boolean;
    title?: string;
    subTitle?: string;
    disableClose?: boolean;
  }>
) => {
  const {
    isVisible,
    setVisible,
    children,
    fullWidth,
    title,
    subTitle,
    disableClose,
  } = props;

  const ref = useClickAway<HTMLDivElement>(() => setVisible(false));

  useKeyPress(["Escape"], () => setVisible(false));

  return (
    <Dialog
      onClose={
        disableClose
          ? (_, reason) =>
              reason !== "backdropClick" ? setVisible(false) : setVisible(true)
          : () => setVisible(false)
      }
      maxWidth={fullWidth ? false : undefined}
      open={isVisible}
      className="overscroll-contain overflow-hidden"
    >
      <div
        ref={ref}
        className="dark:bg-gray-900 overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-rounded-[12px] scrollbar-mx-10 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-900"
      >
        <div className="flex justify-between items-center m-2">
          <div>
            <div className="font-bold leading-tight text-left tracking-tight text-gray-900 dark:text-white">
              {title}
            </div>
            <div className="text-sm text-left tracking-tight text-gray-500 italic">
              {subTitle}
            </div>
          </div>
          <CloseIcon
            className="text-gray-400 cursor-pointer"
            onClick={() => setVisible(false)}
          />
        </div>
        <div className="min-w-[300px] min-h-[100px] p-3">{children}</div>
      </div>
    </Dialog>
  );
};
