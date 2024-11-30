"use client"; // This directive is needed if you haven't added it

export default function Table({
  id,
  hidden,
  thead,
  tbody,
  tfoot,
  onRowClick,
}: {
  id?: string;
  hidden?: boolean;
  thead: string[];
  tbody: (string | number)[][];
  tfoot?: string[];
  onRowClick?: (rowIndex: number) => void;
}) {
  return (
    <table
      id={id}
      hidden={hidden}
      className="text-left text-base w-full mb-2 shadow-float"
    >
      <thead className="bg-[#d9d9d999]">
        <tr>
          {thead.map((col) => (
            <th key={`header_${col}`} className="h-auto p-4 align-middle">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tbody.map((row, row_index) => (
          <tr
            key={`row_${row_index}`}
            className="border-t-light cursor-pointer"
            onClick={() => onRowClick && onRowClick(row_index)} // Handle row click
          >
            {row.map((col, col_index) => (
              <td
                key={`row_${row_index}_col_${col_index}`}
                className="h-auto p-4 align-middle"
              >
                {col}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {tfoot && (
        <tfoot className="border-t-light bg-[#d9d9d999]">
          <tr>
            {tfoot.map((col, index) => (
              <td key={`footer_${index}`} className="h-auto p-4 align-middle">
                {col}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}