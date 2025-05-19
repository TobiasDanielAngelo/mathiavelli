export const MyCheckBox = (props: {
  hidden?: boolean;
  label?: string;
  value?: boolean;
  onChangeValue?: (val: boolean) => void;
  msg?: string;
}) => {
  const { hidden, label, value, msg, onChangeValue } = props;
  if (hidden) return null;

  return (
    <div className="flex flex-col">
      <label className="text-xs text-blue-600">{label ?? "Select Items"}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChangeValue?.(e.target.checked)}
        className="form-checkbox h-5 w-5 text-blue-600 m-2"
      />
      {msg && (
        <label className="block text-xs font-medium dark:text-white mt-1 text-red-600">
          {msg}
        </label>
      )}
    </div>
  );
};
