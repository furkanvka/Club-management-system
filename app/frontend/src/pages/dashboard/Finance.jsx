import React from 'react';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Finance = () => {
  const headers = ['Açıklama', 'Tür', 'Tutar', 'Tarih', 'İşlem'];
  
  const mockTransactions = [
    { id: 1, description: 'Bahar Şenliği Sponsorluk Geliri', type: 'income', amount: 15000, date: '2026-04-10T00:00:00Z' },
    { id: 2, description: 'Afiş ve Broşür Baskısı', type: 'expense', amount: 2500, date: '2026-04-12T00:00:00Z' },
    { id: 3, description: 'Üye Aidatları (Nisan)', type: 'income', amount: 3200, date: '2026-04-15T00:00:00Z' },
    { id: 4, description: 'Konuşmacı Yol Masrafı', type: 'expense', amount: 1200, date: '2026-04-18T00:00:00Z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finans Yönetimi</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Yeni İşlem
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Toplam Gelir</dt>
                  <dd className="text-xl font-semibold text-gray-900">₺18,200.00</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Toplam Gider</dt>
                  <dd className="text-xl font-semibold text-gray-900">₺3,700.00</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-indigo-200 rounded-xl ring-1 ring-indigo-50">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-indigo-500 truncate">Net Bakiye</dt>
                  <dd className="text-xl font-bold text-indigo-900">₺14,500.00</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Son İşlemler</h3>
        </div>
        <Table 
          headers={headers} 
          data={mockTransactions} 
          renderRow={(row) => (
            <>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {row.description}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {row.type === 'income' ? 'Gelir' : 'Gider'}
                </span>
              </td>
              <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {row.type === 'income' ? '+' : '-'}₺{row.amount.toLocaleString('tr-TR')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(row.date).toLocaleDateString('tr-TR')}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button className="text-indigo-600 hover:text-indigo-900">Detay</button>
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
};
