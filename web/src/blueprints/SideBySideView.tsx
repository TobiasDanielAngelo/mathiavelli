import { observer } from "mobx-react-lite";
import { useWindowWidth } from "../constants/hooks";

interface SideBySideViewProps {
  SideA?: React.ReactNode;
  SideB?: React.ReactNode;
  ratio?: number;
  reversed?: boolean;
}

export const SideBySideView = observer(
  ({ SideA, SideB, ratio = 1, reversed = false }: SideBySideViewProps) => {
    const total = ratio + 1;
    const widthA = `${(ratio / total) * 100}%`;
    const widthB = `${(1 / total) * 100}%`;

    const width = useWindowWidth();
    return (
      <div className="lg:flex-grow flex justify-center max-h-[85vh]">
        <div
          className="w-3/4 gap-2 pt-5 flex"
          style={{
            flexDirection:
              width >= 1024 ? (reversed ? "row-reverse" : "row") : "column",
          }}
        >
          <div
            className="lg:overflow-scroll m-2 border border-gray-500 rounded-lg p-2"
            style={{
              width: width >= 1024 ? widthA : "100%",
              display: width >= 1024 || SideA ? "block" : "none",
            }}
          >
            {SideA}
          </div>
          <div
            className="lg:overflow-scroll m-2 border border-gray-500 rounded-lg p-2 items-center justify-center"
            style={{
              width: width >= 1024 ? widthB : "100%",
              display: width >= 1024 || SideB ? "block" : "none",
            }}
          >
            {SideB}
          </div>
        </div>
      </div>
    );
  }
);
