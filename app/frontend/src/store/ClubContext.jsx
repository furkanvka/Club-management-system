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
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('activeRole')); // 'baskan' | 'uye'
  
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]); // full membership objects

  const refreshClubs = useCallback(async () => {
    const token = localStorage.getItem('token');
    const loginType = localStorage.getItem('loginType');

    // Always fetch all clubs (public endpoint)
    try {
      const allData = await clubService.getAllClubs();
      setAllClubs(allData);
    } catch (e) {
      console.error('Failed to fetch all clubs', e);
    }

    if (!token) {
      setMyClubs([]);
      setMyMemberships([]);
      setActiveClub(null);
      setActiveRole(null);
      localStorage.removeItem('activeClub');
      localStorage.removeItem('activeRole');
      return;
    }

    let currentMyClubs = [];
    try {
      const myData = await clubService.getMyClubs();
      currentMyClubs = myData || [];
      setMyClubs(currentMyClubs);
    } catch (e) {
      setMyClubs([]);
    }

    let currentMemberships = [];
    try {
      const memRes = await api.get('/clubs/my-memberships');
      currentMemberships = memRes.data || [];
      setMyMemberships(currentMemberships);
    } catch (e) {
      setMyMemberships([]);
    }

    // Auto-select logic: Only set if not already set to avoid loops
    if (loginType === 'club' && currentMyClubs.length > 0) {
      const club = currentMyClubs[0];
      setActiveClub(prev => (prev?.id === club.id ? prev : club));
      setActiveRole('baskan');
      localStorage.setItem('activeClub', JSON.stringify(club));
      localStorage.setItem('activeRole', 'baskan');
    } else if (currentMyClubs.length === 1) {
      const club = currentMyClubs[0];
      const membership = currentMemberships.find(m => m.club?.id === club.id);
      const role = membership?.role || 'uye';
      setActiveClub(prev => (prev?.id === club.id ? prev : club));
      setActiveRole(role);
      localStorage.setItem('activeClub', JSON.stringify(club));
      localStorage.setItem('activeRole', role);
    }
  }, []);

  useEffect(() => {
    refreshClubs();
  }, [user, refreshClubs]);

  const selectClub = (club, role) => {
    setActiveClub(club);
    setActiveRole(role || 'uye');
    if (club) {
      localStorage.setItem('activeClub', JSON.stringify(club));
      localStorage.setItem('activeRole', role || 'uye');
    } else {
      localStorage.removeItem('activeClub');
      localStorage.removeItem('activeRole');
    }
  };

  return (
    <ClubContext.Provider value={{ myClubs, allClubs, myMemberships, activeClub, activeRole, selectClub, refreshClubs }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
