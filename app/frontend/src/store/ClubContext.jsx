import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clubService } from '../services/clubService';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeClub, setActiveClub] = useState(() => {
    const saved = localStorage.getItem('activeClub');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('activeRole'));
  const [activeMembershipId, setActiveMembershipId] = useState(() => localStorage.getItem('activeMembershipId'));
  const [activeMembershipStatus, setActiveMembershipStatus] = useState(() => localStorage.getItem('activeMembershipStatus') || 'passive');
  
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);

  const refreshClubs = useCallback(async () => {
    const token = localStorage.getItem('token');
    const loginType = localStorage.getItem('loginType');

    if (!token) {
      setMyClubs([]);
      setMyMemberships([]);
      setActiveClub(null);
      setActiveRole(null);
      setActiveMembershipId(null);
      setActiveMembershipStatus('passive');
      localStorage.removeItem('activeClub');
      localStorage.removeItem('activeRole');
      localStorage.removeItem('activeMembershipId');
      localStorage.removeItem('activeMembershipStatus');
      return;
    }

    try {
      const allDataRes = await clubService.getAllClubs();
      setAllClubs(allDataRes || []);

      const myData = await clubService.getMyClubs();
      const currentMyClubs = myData || [];
      setMyClubs(currentMyClubs);
      
      const memRes = await api.get('/clubs/my-memberships');
      const currentMemberships = memRes.data || [];
      setMyMemberships(currentMemberships);

      // Kulüp hesabıyla giriş yapıldıysa, ilk kulübü otomatik seç
      if (loginType === 'club' && currentMyClubs.length > 0) {
          const club = currentMyClubs[0];
          const role = 'baskan';
          setActiveClub(club);
          setActiveRole(role);
          setActiveMembershipId(null);
          setActiveMembershipStatus('active');
          localStorage.setItem('activeClub', JSON.stringify(club));
          localStorage.setItem('activeRole', role);
          localStorage.removeItem('activeMembershipId');
          localStorage.setItem('activeMembershipStatus', 'active');
      } else if (activeClub) {
          // Mevcut seçili kulübü güncelle
          const currentMem = currentMemberships.find(m => m.club?.id === activeClub.id);
          if (currentMem) {
              if (currentMem.role !== activeRole) {
                  setActiveRole(currentMem.role);
                  localStorage.setItem('activeRole', currentMem.role);
              }
              if (String(currentMem.id) !== String(activeMembershipId)) {
                  setActiveMembershipId(currentMem.id);
                  localStorage.setItem('activeMembershipId', currentMem.id);
              }
              if (currentMem.status !== activeMembershipStatus) {
                  setActiveMembershipStatus(currentMem.status || 'passive');
                  localStorage.setItem('activeMembershipStatus', currentMem.status || 'passive');
              }
          }
      } else if (currentMyClubs.length === 1 && loginType !== 'club') {
          // Tek kulübü olan üye için otomatik seç (selectClub'a gerek yok, doğrudan state set et)
          const club = currentMyClubs[0];
          const m = currentMemberships.find(mem => mem.club?.id === club.id);
          const role = m?.role || 'uye';
          setActiveClub(club);
          setActiveRole(role);
          setActiveMembershipId(m?.id || null);
          setActiveMembershipStatus(m?.status || 'passive');
          localStorage.setItem('activeClub', JSON.stringify(club));
          localStorage.setItem('activeRole', role);
          if (m?.id) localStorage.setItem('activeMembershipId', m.id);
          localStorage.setItem('activeMembershipStatus', m?.status || 'passive');
      }
    } catch (e) {
      console.error("Bilgiler tazelenirken hata oluştu", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClub?.id, activeRole, activeMembershipId, activeMembershipStatus]);

  useEffect(() => {
    refreshClubs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sub, user?.loginType]); // Primitive değerleri izle — obje ref karşılaştırması güvenilmez

  const selectClub = (club, role, membershipId, status) => {
    if (!club) {
        setActiveClub(null);
        setActiveRole(null);
        setActiveMembershipId(null);
        setActiveMembershipStatus('passive');
        localStorage.removeItem('activeClub');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('activeMembershipId');
        localStorage.removeItem('activeMembershipStatus');
        return;
    }

    // Eğer ID veya status gönderilmediyse, mevcut üyelikler arasından bul
    let finalId = membershipId;
    let finalStatus = status;
    let finalRole = role;

    if (!finalId || !finalStatus) {
        const found = myMemberships.find(m => m.club?.id === club.id);
        if (found) {
            finalId = found.id;
            finalStatus = found.status;
            if (!finalRole) finalRole = found.role;
        }
    }

    setActiveClub(club);
    setActiveRole(finalRole || 'uye');
    setActiveMembershipId(finalId || null);
    setActiveMembershipStatus(finalStatus || 'passive');
    
    localStorage.setItem('activeClub', JSON.stringify(club));
    localStorage.setItem('activeRole', finalRole || 'uye');
    if (finalId) localStorage.setItem('activeMembershipId', finalId);
    if (finalStatus) localStorage.setItem('activeMembershipStatus', finalStatus);
  };

  return (
    <ClubContext.Provider value={{ myClubs, allClubs, myMemberships, activeClub, activeRole, activeMembershipId, activeMembershipStatus, selectClub, refreshClubs }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
