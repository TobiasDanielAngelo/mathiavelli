import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Text, View } from "react-native";
import { useNavigate } from "react-router-native";
import { toTitleCase } from "../../constants/helpers";
import { allViewPaths, ViewPath } from "../main/";
import { MyIcon } from "../../blueprints/MyIcon";

// ModuleCard Component
const ModuleCard = ({
  title,
  path,
  onPress,
}: {
  title: string;
  path: ViewPath;
  onPress?: () => void;
}) => {
  const navigate = useNavigate();

  const pathLink =
    path.mainLink === "back"
      ? ""
      : path.mainLink !== "" && path.mainLink !== undefined
      ? "/" + path.mainLink
      : "";

  const gotoNavigate = () => {
    path.mainLink === "back" ? onPress?.() : navigate(pathLink);
  };
  return (
    <View>
      <Text
        style={{ color: pathLink ? "blue" : "black" }}
        onPress={gotoNavigate}
      >
        Go to {title}: ({pathLink}){" "}
        {onPress && (
          <Text
            onPress={onPress}
            style={{
              color: path.items.length ? "blue" : "black",
            }}
          >
            {path.mainLink !== "back" ? "More..." : "Back"}
          </Text>
        )}
      </Text>
    </View>
  );
};

// ModularView Component
export const ModularView = observer(() => {
  const [module, setModule] = useState<string>("");

  const currentPaths = allViewPaths.find((s) => s.title === module);

  return (
    <View>
      <View>
        {!currentPaths ? (
          allViewPaths.map((path, index) => (
            <ModuleCard
              title={path.title}
              path={path}
              onPress={() => setModule(path.title)}
              key={index}
            />
          ))
        ) : (
          <View>
            {currentPaths.items.map((item, index) => (
              <ModuleCard
                key={index}
                title={toTitleCase(item)}
                path={{ title: toTitleCase(item), items: [], mainLink: item }}
              />
            ))}
            <ModuleCard
              title="Back"
              path={{ title: "Back", items: [], mainLink: "back" }}
              onPress={() => setModule("")}
            />
          </View>
        )}
      </View>
    </View>
  );
});
