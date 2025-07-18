import { observer } from "mobx-react-lite";
import { useState } from "react";
import { MyTable } from "../../blueprints/MyTable";

export const TestingView = observer(() => {
  const [x, setX] = useState(new Date().toISOString());

  return (
    <>
      <MyTable matrix={[]} />
    </>
  );
});
