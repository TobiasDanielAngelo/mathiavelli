import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { generateShortParam, toOptions } from "../constants/helpers";
import { useKeyPress } from "../constants/hooks";
import { Field } from "../constants/interfaces";
import { MyButton } from "./MyButton";
import { MyInput } from "./MyInput";
import { MyMultiDropdownSelector } from "./MyMultiDropdownSelector";
import { MyDateTimePicker } from "./MyDateTimePicker";
import moment from "moment";
import { frequency } from "../constants/constants";

function getDetails(fields: Field[][]) {
  return fields.flat().reduce<Record<string, String>>((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

export const MyFilter = observer(
  (props: { title: string; fields: Field[][] }) => {
    const { title, fields } = props;

    const [details, setDetails] = useState<any>(getDetails(fields));
    const [_, setParams] = useSearchParams();

    const detailsStringified = Object.fromEntries(
      Object.entries(details)
        .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );

    const onChangeValue = (t: string, name: string) => {
      console.log(t);
      setDetails({ ...details, [name]: t });
    };

    const onClickFilter = () => {
      setParams("q=" + generateShortParam(detailsStringified));
    };

    const onClickReset = async () => {};

    useKeyPress(["Enter"], onClickFilter);

    return (
      <div className="max-w-md mx-auto p-10 dark:bg-gray-900 text-gray-200">
        <h1 className="text-xl mb-2 font-bold leading-tight tracking-tight md:text-2xl">
          {title}
        </h1>
        {fields.map((s, ind) => (
          <div
            className={`grid md:gap-6`}
            key={ind}
            style={{
              gridTemplateColumns: `repeat(${s.length}, minmax(0, 1fr))`,
            }}
          >
            {s.map((t, ind) =>
              !t ? (
                <div key={ind}></div>
              ) : t.type === "text" ? (
                <MyInput
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  key={ind}
                />
              ) : t.type === "check" ? (
                <MyMultiDropdownSelector
                  label={t.label}
                  value={
                    details[t.name] === ""
                      ? []
                      : details[t.name].split(",").map((s: any) => Number(s))
                  }
                  onChangeValue={(u) => onChangeValue(u.join(","), t.name)}
                  key={ind}
                  options={toOptions(["No", "Yes"])}
                />
              ) : t.type === "select" ? (
                <MyMultiDropdownSelector
                  label={t.label}
                  value={
                    details[t.name] === ""
                      ? []
                      : details[t.name].split(",").map((s: any) => Number(s))
                  }
                  onChangeValue={(u) => onChangeValue(u.join(","), t.name)}
                  key={ind}
                  options={toOptions(frequency)}
                />
              ) : ["date", "time", "datetime", "month"].includes(t.type) ? (
                <MyDateTimePicker
                  value={details[t.name]}
                  label={t.label}
                  isDateOnly={t.type === "date" || t.type === "month"}
                  dateFormat={t.type === "month" ? "MMM YYYY" : undefined}
                  isTimeOnly={t.type === "time"}
                  onChangeValue={(u) =>
                    onChangeValue(
                      t.type === "date"
                        ? moment(u).format("YYYY-MM-DD")
                        : moment(u).toISOString(),
                      t.name
                    )
                  }
                  key={ind}
                />
              ) : t.type === "year" ? (
                <MyMultiDropdownSelector
                  value={
                    details[t.name] === ""
                      ? []
                      : details[t.name].split(",").map((s: any) => Number(s))
                  }
                  onChangeValue={(u) => onChangeValue(u.join(","), t.name)}
                  label={t.label}
                  key={ind}
                  options={Array.from(
                    { length: 2050 - 2000 + 1 },
                    (_, i) => 2000 + i
                  ).map((s) => ({ id: s, name: String(s) }))}
                />
              ) : (
                <div
                  className="text-gray-300 items-center justify-center"
                  key={ind}
                >
                  {t.label}
                </div>
              )
            )}
          </div>
        ))}

        <div className="flex flex-row-reverse justify-between items-center">
          <MyButton onClick={onClickFilter} label="Filter Results" />
          <RestartAltIcon
            fontSize="large"
            className="text-gray-600 dark:text-gray-400"
            onClick={onClickReset}
          />
        </div>
      </div>
    );
  }
);
