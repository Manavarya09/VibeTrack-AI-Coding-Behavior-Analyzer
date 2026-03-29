export function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto border-4 border-black rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-black text-white">
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 text-left font-bold text-sm uppercase">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick?.(row)}
              className={`border-b-2 border-black ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
