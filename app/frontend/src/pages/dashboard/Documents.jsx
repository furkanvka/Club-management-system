import React from 'react';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Upload, FileText, Download } from 'lucide-react';

export const Documents = () => {
  const headers = ['Belge Adı', 'Kategori', 'Tarih', 'Boyut', 'İşlem'];
  
  const mockDocs = [
    { id: 1, title: '2025_Genel_Kurul_Tutanagi.pdf', category: 'Resmi', createdAt: '2026-01-15T00:00:00Z', size: '2.4 MB' },
    { id: 2, title: 'Bahar_Senligi_Butce_Plani.xlsx', category: 'Finans', createdAt: '2026-03-10T00:00:00Z', size: '1.1 MB' },
    { id: 3, title: 'Yeni_Uye_Kayit_Formu.docx', category: 'Şablon', createdAt: '2026-02-05T00:00:00Z', size: '450 KB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Belgeler</h1>
        <Button className="flex items-center gap-2">
          <Upload size={16} /> Belge Yükle
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex gap-2">
          {['Tümü', 'Resmi', 'Finans', 'Şablon', 'Etkinlik'].map(cat => (
             <span key={cat} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200">
               {cat}
             </span>
          ))}
        </div>
        <Table 
          headers={headers} 
          data={mockDocs} 
          renderRow={(row) => (
            <>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                {row.title}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {row.category}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(row.createdAt).toLocaleDateString('tr-TR')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.size}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full">
                  <Download className="h-4 w-4 mr-1" /> İndir
                </button>
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
};
