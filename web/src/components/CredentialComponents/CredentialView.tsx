import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MyIcon } from "../../blueprints/MyIcon";
import {
  AUTHENTICATOR_CHOICES,
  Credential,
  CredentialInterface,
} from "../../api/CredentialStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { getUniqueIdsFromFK, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  CredentialCollection,
  CredentialFilter,
  CredentialForm,
  CredentialTable,
  CredentialViewContext,
} from "./CredentialComponents";

export const CredentialView = observer(() => {
  const { credentialStore, platformStore, accountStore } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
  } = useVisible();
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(new Credential({}).$view) as (keyof CredentialInterface)[],
    "shownFieldsCredential"
  );

  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchFcn = async () => {
    const resp = await credentialStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const platform = getUniqueIdsFromFK(resp.data, "platform");
    if (platform.length) platformStore.fetchAll(`id__in=${platform.join(",")}`);
    const billingAccounts = getUniqueIdsFromFK(resp.data, "platform").flat(1);
    if (billingAccounts.length)
      accountStore.fetchAll(`id__in=${billingAccounts.join(",")}`);
  };

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
  };

  const onClickPrev = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set("page", String(Math.max(currentPage - 1, 1)));
      return newParams;
    });
  };

  const onClickNext = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set(
        "page",
        String(
          Math.min(currentPage + 1, pageDetails?.totalPages ?? currentPage)
        )
      );
      return newParams;
    });
  };

  const onClickPage = (s: number) => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      newParams.set("page", String(s));
      return newParams;
    });
  };

  const PageBar = () => (
    <MyPageBar
      pageDetails={pageDetails}
      onClickNext={onClickNext}
      onClickPrev={onClickPrev}
      onClickPage={onClickPage}
    />
  );

  const itemMap = useMemo(
    () =>
      [
        {
          key: "platform",
          values: platformStore.items,
          label: "name",
        },
        {
          key: "billingAccount",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "authenticatorApp",
          values: AUTHENTICATOR_CHOICES,
          label: "",
        },
      ] as KV<any>[],
    [platformStore.items.length, accountStore.items.length]
  );

  const actions = useMemo(
    () => [
      {
        icon: <MyIcon icon="NoteAdd" fontSize="large" label="CRED." />,
        name: "Add a Credential",
        onClick: () => setVisible1(true),
      },
      {
        icon: <MyIcon icon="ViewList" fontSize="large" label="FIELDS" />,
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: <MyIcon icon="FilterListAlt" fontSize="large" label="FILTERS" />,
        name: "Filters",
        onClick: () => setVisible3(true),
      },
    ],
    []
  );

  useEffect(() => {
    fetchFcn();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    fetchFcn: fetchFcn,
  };

  return (
    <CredentialViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <CredentialForm setVisible={setVisible1} fetchFcn={fetchFcn} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) =>
              setShownFields(t as (keyof CredentialInterface)[])
            }
            options={Object.keys(new Credential({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <CredentialFilter />
        </MyModal>
        {view === "card" ? <CredentialCollection /> : <CredentialTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </CredentialViewContext.Provider>
  );
});
