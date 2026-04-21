import React from 'react';

export const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide sm:pl-6"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
