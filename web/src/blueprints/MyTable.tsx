export const MyTable = (props: {
  matrix: React.ReactNode[][];
  hidden?: boolean;
}) => {
  const { matrix, hidden } = props;

  return hidden ? (
    <></>
  ) : (
    <div
      className={"relative overflow-x-auto shadow-md sm:rounded-lg mt-4 mx-5"}
    >
      <table className="m-auto min-w-[50%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-md text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {matrix[0].map((s, ind) => (
              <th scope="col" className="px-2 py-1 text-center" key={ind}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.slice(1).map((s, ind) => (
            <tr
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              key={ind}
            >
              <th
                scope="row"
                className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white"
              >
                {s[0]}
              </th>
              {s.slice(1).map((t, ind) => (
                <td
                  className="px-6 py-4 justify-between border-solid"
                  key={ind}
                >
                  {t}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
