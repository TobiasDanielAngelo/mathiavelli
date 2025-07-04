import { observer } from "mobx-react-lite";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { getStoreSignature, sortByKey } from "../constants/helpers";
import { useVisible, useWindowWidth } from "../constants/hooks";
import { StateSetter } from "../constants/interfaces";
import { MyIcon } from "./MyIcon";
import { MyModal } from "./MyModal";
import { MyTable } from "./MyTable";

type CalendarEvent = {
  id: string | number;
  title: string;
  dateStart: string;
  dateEnd: string;
  dateCompleted?: string;
};

const EventItem = (props: {
  label: string;
  modalContent: React.ReactNode;
  noIcon?: boolean;
  date: number;
}) => {
  const { label, modalContent, noIcon, date } = props;
  const { isVisible1, setVisible1 } = useVisible();
  const width = useWindowWidth();

  return (
    <>
      <MyModal
        isVisible={isVisible1}
        setVisible={setVisible1}
        title="Events"
        disableClose
      >
        {modalContent}
      </MyModal>
      <span onDoubleClick={() => setVisible1(true)}>{date}</span>
      {!noIcon && (
        <MyIcon
          icon="Event"
          fontSize="small"
          label={width > 1024 ? label : ""}
          onDoubleClick={() => setVisible1(true)}
        />
      )}
    </>
  );
};

export type CalendarView = "month" | "year" | "decade";

export const MyCalendar = observer(
  (props: {
    date: Date;
    setDate: StateSetter<Date>;
    view: CalendarView;
    setView: StateSetter<CalendarView>;
    events: CalendarEvent[];
    noIcon?: boolean;
  }) => {
    const { date, setDate, view, setView, events, noIcon } = props;
    const [currentDate, setCurrentDate] = useState(moment());

    const startDecade = Math.floor(currentDate.year() / 10) * 10;

    useEffect(() => {
      setDate(currentDate.toDate());
    }, [currentDate]);

    const handlePrev = () => {
      const newDate =
        view === "month"
          ? moment(currentDate).subtract(1, "month")
          : view === "year"
          ? moment(currentDate).subtract(1, "year")
          : view === "decade"
          ? moment(currentDate).subtract(10, "year").startOf("year")
          : moment(currentDate);
      setCurrentDate(newDate);
    };

    const handleNext = () => {
      const newDate =
        view === "month"
          ? moment(currentDate).add(1, "month").startOf("month")
          : view === "year"
          ? moment(currentDate).add(1, "year").startOf("year")
          : view === "decade"
          ? moment(currentDate)
              .add(10, "year")
              .startOf("year")
              .year(Math.floor(moment(currentDate).year() / 10) * 10 + 10)
          : moment(currentDate);

      setCurrentDate(newDate);
    };

    const renderMonthView = useCallback(() => {
      const start = moment(currentDate).startOf("month").startOf("week");
      const days = Array.from({ length: 42 }, (_, i) =>
        moment(start).add(i, "day")
      );
      return (
        <div className="grid grid-cols-7 gap-4 h-[90%]">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
            <div
              key={d}
              className={`text-center font-bold ${
                i === 0 || i === 6 ? "text-red-500" : ""
              }`}
            >
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const isToday = day.isSame(moment(), "day");
            const isSelected = day.isSame(date, "day");
            const isWeekend = day.day() === 0 || day.day() === 6;

            const dayEvents = sortByKey(events, "dateStart").filter(
              (e) =>
                day.format("YYYY-MM-DD") ===
                  moment(e.dateStart).format("YYYY-MM-DD") ||
                day.format("YYYY-MM-DD") ===
                  moment(e.dateEnd).format("YYYY-MM-DD")
            );

            return (
              <div
                key={i}
                onClick={() => setDate(day.toDate())}
                className={`md:flex-row-reverse text-right text-sm md:text-md items-right justify-between flex flex-col-reverse p-1 md:p-2 rounded cursor-pointer
                ${day.month() === currentDate.month() ? "" : "text-gray-500"}
                ${isWeekend ? "text-red-500" : ""}
                ${isToday ? "text-blue-500 font-bold" : ""}
                ${isSelected ? "bg-teal-300 text-black" : ""}`}
              >
                <EventItem
                  noIcon={noIcon || !dayEvents.length}
                  date={day.date()}
                  label={String(dayEvents.length)}
                  modalContent={
                    <MyTable
                      matrix={[
                        ["Event", "Time", "Completed?"],
                        ...sortByKey(dayEvents, "dateStart").map((s) => [
                          s.title,
                          moment(s.dateStart).format("h:mm A"),
                          <MyIcon
                            icon={
                              s.dateCompleted
                                ? "CheckBox"
                                : "CheckBoxOutlineBlank"
                            }
                          />,
                        ]),
                      ]}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      );
    }, [getStoreSignature(events), currentDate, date, events.length]);

    const renderYearView = () => (
      <div className="grid grid-cols-3 gap-2 h-[90%]">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            onClick={() => {
              setCurrentDate(moment(currentDate).month(i));
              setView("month");
            }}
            className="p-4 text-center rounded shadow cursor-pointer hover:bg-gray-500"
          >
            {moment().month(i).format("MMM")}
          </div>
        ))}
      </div>
    );

    const renderDecadeView = () => (
      <div className="grid grid-cols-3 gap-5 h-[90%]">
        {Array.from({ length: 12 }, (_, i) => startDecade - 1 + i).map(
          (year) => (
            <div
              key={year}
              onClick={() => {
                setCurrentDate(moment(currentDate).year(year));
                setView("year");
              }}
              className={`p-4 text-center rounded cursor-pointer shadow ${
                year === currentDate.year() ? "bg-blue-400" : ""
              }`}
            >
              {year}
            </div>
          )
        )}
      </div>
    );

    return (
      <div className="p-4 rounded-xl shadow-xl h-full">
        <div className="flex justify-between items-center mb-4">
          <div onClick={handlePrev}>
            <MyIcon icon="KeyboardArrowLeft" fontSize="large" />
          </div>
          <div
            onClick={() =>
              setView(
                view === "month" ? "year" : view === "year" ? "decade" : "month"
              )
            }
            className="font-bold"
          >
            {view === "month" && currentDate.format("MMMM YYYY")}
            {view === "year" && currentDate.format("YYYY")}
            {view === "decade" && `${startDecade} - ${startDecade + 9}`}
          </div>
          <div onClick={handleNext}>
            <MyIcon icon="KeyboardArrowRight" fontSize="large" />
          </div>
        </div>
        {view === "month" && renderMonthView()}
        {view === "year" && renderYearView()}
        {view === "decade" && renderDecadeView()}
      </div>
    );
  }
);
