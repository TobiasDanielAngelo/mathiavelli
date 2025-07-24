import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { MyEisenhowerChart } from "../../blueprints/MyCharts/MyEisenhowerChart";
import { MyImage } from "../../blueprints/MyImages";
import { MyMultiDropdownSelector } from "../../blueprints";
import { toOptions } from "../../constants/helpers";
import { ScrollPicker } from "../../blueprints/MyScrollPicker";
import { TimePicker } from "../../blueprints/TimePicker";

export const TestingView = observer(() => {
  const [value, setValue] = useState<Date>(new Date());
  return <TimePicker time={value} setTime={setValue} />;
});
