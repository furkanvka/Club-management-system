import React, { useEffect, useState } from 'react';
import { useClub } from '../../store/ClubContext';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import api from '../../services/api';

export const Events = () => {
  const { activeClub } = useClub();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeClub) {
      api.get(`/clubs/${activeClub.id}/events`).then(res => {
        setEvents(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [activeClub]);

  const headers = ['Etkinlik Adı', 'Tarih', 'Konum', 'Kota', 'Durum', 'İşlem'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Etkinlik Oluştur
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Etkinlik Listesi</h3>
          </div>
          {loading ? (
             <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
          ) : (
            <Table 
              headers={headers} 
              data={events.length > 0 ? events : [{ id: 1, name: 'Tanışma Toplantısı', eventDate: '2026-05-10T14:00:00Z', location: 'Amfi 1', capacity: 100, status: 'upcoming' }, { id: 2, name: 'Yapay Zeka Semineri', eventDate: '2026-05-20T10:00:00Z', location: 'Konferans Salonu', capacity: 250, status: 'upcoming' }]} 
              renderRow={(row) => (
                <>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {row.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {new Date(row.eventDate).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.location || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{row.capacity || 'Sınırsız'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button className="text-indigo-600 hover:text-indigo-900">Detay</button>
                  </td>
                </>
              )}
            />
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Yaklaşan Etkinlikler</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">Takvim görünümü yakında eklenecektir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
