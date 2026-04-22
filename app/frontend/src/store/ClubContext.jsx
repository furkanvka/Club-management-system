import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clubService } from '../services/clubService';
import api from '../services/api';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [activeClub, setActiveClub] = useState(null);
  const [activeRole, setActiveRole] = useState(null); // 'baskan' | 'uye'
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]); // full membership objects

  const refreshClubs = useCallback(async () => {
    // Always fetch all clubs (public endpoint)
    try {
      const allData = await clubService.getAllClubs();
      setAllClubs(allData);
    } catch (e) {
      console.error('Failed to fetch all clubs', e);
    }

    // Fetch user's clubs only if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      setMyClubs([]);
      setMyMemberships([]);
      return;
    }

    try {
      const myData = await clubService.getMyClubs();
      setMyClubs(myData || []);
    } catch (e) {
      setMyClubs([]);
    }

    try {
      const memRes = await api.get('/clubs/my-memberships');
      setMyMemberships(memRes.data || []);
    } catch (e) {
      setMyMemberships([]);
    }
  }, []);

  useEffect(() => {
    refreshClubs();
  }, [refreshClubs]);

  const selectClub = (club, role) => {
    setActiveClub(club);
    setActiveRole(role || 'uye');
  };

  return (
    <ClubContext.Provider value={{ myClubs, allClubs, myMemberships, activeClub, activeRole, selectClub, refreshClubs }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
