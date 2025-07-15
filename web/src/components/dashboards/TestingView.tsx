import { observer } from "mobx-react-lite";
import { MyChatBot } from "../../blueprints/MyChatBot";

export const TestingView = observer(() => {
  return <MyChatBot />;
});
