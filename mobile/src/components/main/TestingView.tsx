import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Text } from "react-native";

export const TestingView = observer(() => {
  const [value, setValue] = useState<Date>(new Date());
  return <Text style={{ textAlign: "center" }}>Test</Text>;
});
