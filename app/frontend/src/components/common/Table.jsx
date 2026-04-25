import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export const Table = ({ 
  headers, 
  data = [], 
  renderRow, 
  loading = false,
  emptyMessage = 'Kayıt bulunamadı.',
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50/50">
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-500">Veriler yükleniyor...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Inbox className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr 
                key={i} 
                className="hover:bg-gray-50/80 transition-colors duration-150"
              >
                {renderRow(row)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap ${className}`}>
    {children}
  </td>
);
