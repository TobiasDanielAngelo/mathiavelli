import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MyImage } from "../../blueprints/MyImages";
import { titleToCamel, toTitleCase } from "../../constants/helpers";
import { allViewPaths, ViewPath } from "../main/NavigationBar";

// ModuleCard Component
const ModuleCard = ({ title, path }: { title: string; path: ViewPath }) => {
  const renderExtraInfo = path.items.length ? (
    <div className="cursor-pointer text-sm text-gray-500 font-bold">
      More...
    </div>
  ) : null;

  return (
    <div className="mx-5 my-2 md:my-8 flex flex-row rounded-full shadow-md h-[100px] p-2 shrink-0 border border-gray-800 bg-gray-900">
      <div className="w-20 relative rounded-full border-2 items-center my-auto p-3 mx-5 bg-gradient-to-br from-blue-900 via-blue-500 to-blue-700">
        <Link
          to={path.mainLink === "back" ? "" : path.mainLink}
          className={path.mainLink ? "cursor-pointer" : "cursor-default"}
        >
          <MyImage image={titleToCamel(path.title)} />
        </Link>
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <div className="cursor-default text-sm text-gray-500 font-bold">
            Go to
          </div>
          <div className="cursor-default text-lg">
            <span className="font-bold">{title}</span>
          </div>
        </div>
        {renderExtraInfo}
      </div>
    </div>
  );
};

// ModularView Component
export const ModularView = observer(() => {
  const [module, setModule] = useState<string>("");

  const currentPaths = allViewPaths.find((s) => s.title === module);

  const renderModuleCards = (paths: ViewPath[]) =>
    paths.map((path, index) => (
      <div key={index} onClick={() => setModule(path.title)}>
        <ModuleCard title={path.title} path={path} />
      </div>
    ));

  return (
    <div className="mx-auto w-full md:px-44 max-h-[85vh] flex-grow overflow-scroll">
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] m-3">
        {currentPaths ? (
          <>
            {currentPaths.items.map((item, index) => (
              <ModuleCard
                key={index}
                title={toTitleCase(item)}
                path={{ title: toTitleCase(item), items: [], mainLink: item }}
              />
            ))}
            <div onClick={() => setModule("")}>
              <ModuleCard
                title="Back"
                path={{ title: "Back", items: [], mainLink: "back" }}
              />
            </div>
          </>
        ) : (
          renderModuleCards(allViewPaths)
        )}
      </div>
    </div>
  );
});
