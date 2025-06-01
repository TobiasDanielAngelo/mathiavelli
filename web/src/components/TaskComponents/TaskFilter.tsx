import { observer } from "mobx-react-lite";
import { MyFilter } from "../../blueprints/MyFilter";

export const TaskFilter = observer(
  (props: { setVisible?: (t: boolean) => void }) => {
    const { setVisible } = props;

    setVisible;
    const fields = [
      [
        {
          name: "title__search",
          label: "Title Search",
          type: "text",
        },
        {
          name: "goal__title__search",
          label: "Goal Title",
          type: "text",
        },
      ],
      [
        {
          name: "description__search",
          label: "Description Search",
          type: "text",
        },
      ],
      [
        {
          name: "is_completed__in",
          label: "Completed?",
          type: "check",
        },
        {
          name: "is_cancelled__in",
          label: "Cancelled?",
          type: "check",
        },
      ],
      [
        {
          name: "date_completed__gte",
          label: "Date Completed Start",
          type: "date",
        },
        {
          name: "date_completed__lte",
          label: "Date Completed End",
          type: "date",
        },
        {
          name: "date_completed__year__in",
          label: "Date Completed Year",
          type: "year",
        },
      ],
      [
        {
          name: "date_created__gte",
          label: "Date Created Start",
          type: "date",
        },
        {
          name: "date_created__lte",
          label: "Date Created End",
          type: "date",
        },
      ],
      [
        {
          name: "date_start__gte",
          label: "Date Start (Start)",
          type: "date",
        },
        {
          name: "date_completed__lte",
          label: "Date Start (End)",
          type: "date",
        },
      ],
      [
        {
          name: "date_end__gte",
          label: "Date End (Start)",
          type: "date",
        },
        {
          name: "date_end__lte",
          label: "Date End (End)",
          type: "date",
        },
      ],
      [
        {
          name: "due_date__gte",
          label: "Due Date (Start)",
          type: "date",
        },
        {
          name: "due_date__lte",
          label: "Due Date (End)",
          type: "date",
        },
      ],
      [
        {
          name: "repeat__in",
          label: "Repeat",
          type: "select",
        },
      ],
    ];

    return <MyFilter title="Task Filters" fields={fields} />;
  }
);
