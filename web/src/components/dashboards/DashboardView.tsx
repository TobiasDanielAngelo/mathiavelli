import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { TwoDates } from "../../constants/classes";
import { useCalendarProps, useVisible } from "../../constants/hooks";
import { EventCard, EventDisplay } from "../modules/EventComponents";
import { TaskDashboard } from "../modules/TaskComponents";
import { TransactionDashboard } from "../modules/TransactionComponents";
import { WeighInDashboard } from "../modules/WeighInComponents";
import { MyDropdownSelector } from "../../blueprints";
import { camelCaseToWords } from "../../constants/helpers";
import { AccountForm } from "../modules/AccountComponents";
import { BodyFatForm } from "../modules/BodyFatComponents";
import { BuyListItemForm } from "../modules/BuyListItemComponents";
import { CategoryForm } from "../modules/CategoryComponents";
import { CredentialForm } from "../modules/CredentialComponents";
import { EventForm } from "../modules/EventComponents";
import { FollowUpForm } from "../modules/FollowUpComponents";
import { GoalForm } from "../modules/GoalComponents";
import { HabitForm } from "../modules/HabitComponents";
import { HabitLogForm } from "../modules/HabitLogComponents";
import { InventoryCategoryForm } from "../modules/InventoryCategoryComponents";
import { IssueCommentForm } from "../modules/IssueCommentComponents";
import { IssueTagForm } from "../modules/IssueTagComponents";
import { JobForm } from "../modules/JobComponents";
import { JournalForm } from "../modules/JournalComponents";
import { MealForm } from "../modules/MealComponents";
import { NoteForm } from "../modules/NoteComponents";
import { PayableForm } from "../modules/PayableComponents";
import { PersonalItemForm } from "../modules/PersonalItemComponents";
import { PlatformForm } from "../modules/PlatformComponents";
import { ReceivableForm } from "../modules/ReceivableComponents";
import { ScheduleForm } from "../modules/ScheduleComponents";
import { SettingForm } from "../modules/SettingComponents";
import { TagForm } from "../modules/TagComponents";
import { TaskForm } from "../modules/TaskComponents";
import { TicketForm } from "../modules/TicketComponents";
import { TransactionForm } from "../modules/TransactionComponents";
import { WaistMeasurementForm } from "../modules/WaistMeasurementComponents";
import { WeighInForm } from "../modules/WeighInComponents";
import { WorkoutForm } from "../modules/WorkoutComponents";
import { KV } from "../../constants/interfaces";

const AllForms = {
  JournalForm,
  AccountForm,
  BodyFatForm,
  BuyListItemForm,
  CategoryForm,
  CredentialForm,
  EventForm,
  FollowUpForm,
  GoalForm,
  HabitForm,
  HabitLogForm,
  InventoryCategoryForm,
  IssueCommentForm,
  IssueTagForm,
  JobForm,
  MealForm,
  NoteForm,
  PayableForm,
  PersonalItemForm,
  PlatformForm,
  ReceivableForm,
  ScheduleForm,
  SettingForm,
  TagForm,
  TaskForm,
  TicketForm,
  TransactionForm,
  WaistMeasurementForm,
  WeighInForm,
  WorkoutForm,
};

const FormNames = Object.keys(AllForms);

export const DashboardView = observer(() => {
  const { transactionStore, categoryStore, accountStore, eventStore } =
    useStore();
  const { setVisible1, isVisible1 } = useVisible();

  const [selectedForm, setSelectedForm] = useState(0);

  const FormComponent =
    AllForms[FormNames[selectedForm].replace(" ", "") as keyof typeof AllForms];

  const itemMap = useMemo(
    () =>
      [
        {
          key: "transmitter",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "receiver",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "account",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "category",
          values: categoryStore.items,
          label: "title",
        },
        {
          key: "categoryNature",
          values: CATEGORY_CHOICES,
          label: "",
        },
      ] as KV<any>[],
    [
      transactionStore.items.length,
      categoryStore.items.length,
      accountStore.items.length,
    ]
  );

  const calendarProps = useCalendarProps();
  const { start, end, date } = calendarProps;

  const fetchFcn = async () => {
    const newParams = new URLSearchParams({
      page: "all",
      date_start__gte: start.toISOString(),
      date_start__lte: end.toISOString(),
      order_by: "date_start",
    });
    const resp = await eventStore.fetchAll(newParams.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
  };

  useEffect(() => {
    fetchFcn();
  }, [date]);

  const actions = useMemo(
    () => [
      {
        icon: <MyIcon icon={"DynamicForm"} fontSize="large" label={"FORMS"} />,
        name: "All Forms",
        onClick: () => setVisible1(true),
      },
    ],
    []
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 m-2 gap-5">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <div className="top-0 sticky">
          <MyDropdownSelector
            options={FormNames.map((s, ind) => ({
              name: camelCaseToWords(s),
              id: ind,
            }))}
            value={selectedForm}
            onChangeValue={setSelectedForm}
          />
        </div>
        <FormComponent />
      </MyModal>
      <MyGenericCollection
        items={eventStore.items.filter(
          (s) => !s.isArchived && new TwoDates(s.dateStart, date).isEqualDate
        )}
        CardComponent={EventCard}
        title="Events"
      />
      <EventDisplay calendarProps={calendarProps} />
      <TaskDashboard />
      <TransactionDashboard graph="pie" itemMap={itemMap} />
      <TransactionDashboard graph="line" itemMap={itemMap} />
      <WeighInDashboard />
      <MySpeedDial actions={actions} />
    </div>
  );
});
