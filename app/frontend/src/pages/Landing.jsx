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
  Globe,
  Clock
} from 'lucide-react';
import { Card } from '../components/common/Card';

const TwitterIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

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
        
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Include events happening today
        const upcomingEvents = (eventsRes.data || []).filter(e => new Date(e.eventDate) >= now);
        setEvents(upcomingEvents);
      } catch (err) {
        console.error("Public data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-indigo-100">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 tracking-tight block leading-none">ClubMS</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:block text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Öğrenci Girişi
          </button>
          <Button onClick={() => navigate('/club-login')} size="md" className="rounded-xl font-bold">
            Kulüp Girişi
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-40 pb-20 flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center space-y-8 mb-32 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-indigo-100">
              <Sparkles size={14} className="text-indigo-500" /> Üniversite Topluluk Platformu
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Kulübünüzü <span className="text-indigo-600">Modern Bir Şekilde</span> Yönetin
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Etkinlikler, görevler, belgeler ve finans yönetimini profesyonel bir arayüzle tek bir platformda birleştirin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Button onClick={() => navigate('/login')} size="lg" className="w-full sm:w-auto px-12 py-4 rounded-xl text-lg font-bold group shadow-indigo-100">
                 Hemen Başla 
                 <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
               </Button>
               <Button onClick={() => navigate('/club-login')} variant="secondary" size="lg" className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-bold">
                 Kulüp Girişi
               </Button>
            </div>
          </div>

          <div className="space-y-32">
            {/* Active Clubs Section */}
            <div className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Users className="text-indigo-600" size={24} /> Aktif Kulüpler
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Platformdaki güncel topluluklar</p>
                </div>
                <div className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg text-xs font-bold">
                  {clubs.length} TOPLAM
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                  ))
                ) : clubs.length === 0 ? (
                  <div className="col-span-full py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-medium italic">Henüz onaylı kulüp bulunmuyor.</p>
                  </div>
                ) : (
                  clubs.map(club => (
                    <Card key={club.id} className="group cursor-default hover:border-indigo-200 transition-all" noPadding>
                      <div className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-105 transition-transform">
                          {club.logoUrl ? (
                            <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                          ) : club.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{club.name}</h3>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{club.category || 'Genel'}</p>
                        </div>
                        <button onClick={() => navigate('/login')} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events Section */}
            <div className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Calendar className="text-indigo-600" size={24} /> Yaklaşan Etkinlikler
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Kaçırmamanız gereken yeni etkinlikler</p>
                </div>
                <div className="relative hidden sm:block">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    placeholder="Etkinlik ara..." 
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 text-xs font-bold rounded-xl outline-none w-48 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                  ))
                ) : events.length === 0 ? (
                  <div className="col-span-full py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">Henüz Etkinlik Yok</h3>
                    <p className="text-sm text-gray-400 mt-1">Şu an planlanmış bir etkinlik bulunmuyor.</p>
                  </div>
                ) : (
                  events.map(event => {
                    const date = new Date(event.eventDate);
                    const day = date.getDate();
                    const month = date.toLocaleString('tr-TR', { month: 'short' }).toUpperCase();

                    return (
                      <Card key={event.id} className="group flex flex-col h-full" noPadding>
                        <div className="p-8 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-6">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                              {event.club?.name || 'Üniversite Kulübü'}
                            </span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 leading-none">{day}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{month}</div>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
                            {event.name}
                          </h3>
                          
                          <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium">
                              <MapPin size={16} className="text-gray-400" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium">
                              <Clock size={16} className="text-gray-400" />
                              {date.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <Button 
                            variant="secondary" 
                            className="w-full mt-auto font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                            onClick={() => navigate('/login')}
                            icon={ArrowRight}
                          >
                            Detayları Gör
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-white tracking-tight">2.5K+</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Aktif Üye</div>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-gray-800 py-8 md:py-0">
            <div className="text-4xl font-bold text-white tracking-tight">150+</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Başarılı Etkinlik</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-white tracking-tight">45+</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Kayıtlı Kulüp</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">ClubMS Platform</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} ClubMS. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
             <a href="https://twitter.com/clubms_platform" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-indigo-600 transition-colors" title="Twitter">
               <TwitterIcon size={18} />
             </a>
             <a href="https://instagram.com/clubms_platform" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-indigo-600 transition-colors" title="Instagram">
               <InstagramIcon size={18} />
             </a>
             <a href="https://linkedin.com/company/clubms" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-indigo-600 transition-colors" title="LinkedIn">
               <LinkedinIcon size={18} />
             </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
