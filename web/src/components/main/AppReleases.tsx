import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useStore } from "../../api/Store";
import { MyTable } from "../../blueprints/MyTable";

export const AppReleases = observer(() => {
  const { appReleaseStore } = useStore();
  const matrix = [
    ["Title", "File", "Description"],
    ...appReleaseStore.items.map((s) => [
      s.title,
      <a href={String(s.file)}>Download the App</a>,
      s.description,
    ]),
  ];

  useEffect(() => {
    appReleaseStore.fetchAll("page=all");
  }, []);

  return <MyTable matrix={matrix} />;
});
