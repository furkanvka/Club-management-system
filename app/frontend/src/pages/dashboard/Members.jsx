import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { memberService } from '../../services/memberService';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Search, Plus } from 'lucide-react';

export const Members = () => {
  const { activeClub } = useClub();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeClub) {
      memberService.getMembers(activeClub.id).then(data => {
        setMembers(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [activeClub]);

  const headers = ['Üye Adı', 'Rol', 'Katılım Tarihi', 'Durum', 'İşlem'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Üye Yönetimi</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Yeni Üye Ekle
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Üye ara..."
            />
          </div>
          <Button variant="secondary">Filtrele</Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : (
          <Table 
            headers={headers} 
            data={members.length > 0 ? members : [{ id: 1, user: { email: 'ali.yilmaz@edu.tr' }, role: 'baskan', status: 'active', joinedAt: '2023-09-15' }, { id: 2, user: { email: 'ayse.demir@edu.tr' }, role: 'uye', status: 'active', joinedAt: '2023-09-20' }]} 
            renderRow={(row) => (
              <>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {row.user?.email || 'Bilinmiyor'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    {row.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(row.joinedAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.status === 'active' ? 'Aktif' : 'Beklemede'}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button className="text-indigo-600 hover:text-indigo-900 mx-2">Düzenle</button>
                  <button className="text-red-600 hover:text-red-900">Sil</button>
                </td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};
