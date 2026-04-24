import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import api from '../services/api';
import { 
  Users, 
  Building2, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Search,
  Globe
} from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          api.get('/public/clubs'),
          api.get('/public/events')
        ]);
        setClubs(clubsRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error("Public data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col selection:bg-indigo-100">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 tracking-tight block leading-none">ClubMS</span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Management System</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:block text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Öğrenci Girişi
          </button>
          <Button onClick={() => navigate('/club-login')} className="rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-indigo-100">
            Kulüp Girişi
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 mb-4">
              <Sparkles size={14} /> Üniversite Topluluk Platformu
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Kulübünüzü <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Tek Bir Yerden</span> Yönetin
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Etkinlikler, görevler, belgeler ve finans yönetimini modern bir arayüzle tek bir platformda birleştirin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <Button onClick={() => navigate('/register')} className="w-full sm:w-auto px-10 py-4 rounded-2xl text-lg font-black shadow-xl shadow-indigo-100 group">
                 Hemen Başla 
                 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
               <button onClick={() => navigate('/club-register')} className="w-full sm:w-auto px-10 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-lg font-black hover:bg-gray-50 hover:border-gray-300 transition-all">
                 Kulübünü Kaydet
               </button>
            </div>
          </div>

          {/* Dynamic Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Active Clubs */}
            <div className="lg:col-span-4 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Users className="text-indigo-600" size={24} /> Aktif Kulüpler
                </h2>
                <span className="px-2.5 py-1 bg-white border border-gray-100 text-gray-500 rounded-lg text-[10px] font-bold">
                  {clubs.length} Toplam
                </span>
              </div>

              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-3xl" />
                  ))
                ) : clubs.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-medium italic">Henüz onaylı kulüp yok.</p>
                  </div>
                ) : (
                  clubs.map(club => (
                    <div key={club.id} className="group bg-white border border-gray-100 p-5 rounded-[2rem] hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-default">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl group-hover:scale-110 transition-transform">
                          {club.logoUrl ? (
                            <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
                          ) : club.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{club.name}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{club.category || 'Genel'}</p>
                        </div>
                        <button onClick={() => navigate('/login')} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Upcoming Events */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Calendar className="text-purple-600" size={24} /> Yaklaşan Etkinlikler
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100">
                  <Search size={14} className="text-gray-400" />
                  <input placeholder="Etkinlik ara..." className="bg-transparent border-none text-xs font-bold outline-none w-32" />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-[2.5rem]" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Henüz Etkinlik Yok</h3>
                  <p className="text-gray-400 mt-2">Şu an planlanmış bir etkinlik bulunmuyor. Daha sonra tekrar kontrol edin!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map(event => {
                    const date = new Date(event.eventDate);
                    const day = date.getDate();
                    const month = date.toLocaleString('tr-TR', { month: 'short' }).toUpperCase();

                    return (
                      <div key={event.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{month}</span>
                            <span className="text-xl font-black leading-none">{day}</span>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            {event.club?.name || 'Üniversite Kulübü'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                          {event.name}
                        </h3>
                        
                        <div className="space-y-3 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <MapPin size={16} className="text-indigo-400" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Calendar size={16} className="text-indigo-400" />
                            {date.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <button onClick={() => navigate('/login')} className="mt-8 w-full py-4 bg-gray-50 group-hover:bg-indigo-600 text-gray-600 group-hover:text-white rounded-2xl text-sm font-black transition-all duration-500 flex items-center justify-center gap-2">
                          Detayları Gör & Katıl
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Stats Footer Section */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white">
          <div className="space-y-2">
            <div className="text-4xl font-black">2.5K+</div>
            <div className="text-indigo-200 text-xs font-black uppercase tracking-widest">Aktif Üye</div>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-indigo-500/50 py-8 md:py-0">
            <div className="text-4xl font-black">150+</div>
            <div className="text-indigo-200 text-xs font-black uppercase tracking-widest">Başarılı Etkinlik</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black">45+</div>
            <div className="text-indigo-200 text-xs font-black uppercase tracking-widest">Kayıtlı Kulüp</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">CMS</div>
            <span className="font-black text-gray-900 tracking-tight">ClubMS Platform</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} ClubMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <Globe size={20} className="text-gray-300 hover:text-indigo-600 cursor-pointer transition-colors" />
             <div className="w-8 h-8 bg-gray-100 rounded-full" />
             <div className="w-8 h-8 bg-gray-100 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};
