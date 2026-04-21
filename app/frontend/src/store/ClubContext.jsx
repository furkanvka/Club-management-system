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
    try {
      const [myData, allData] = await Promise.all([
        clubService.getMyClubs(),
        clubService.getAllClubs()
      ]);
      setMyClubs(myData);
      setAllClubs(allData);

      // Also fetch memberships to know roles
      try {
        const memRes = await api.get('/clubs/my-memberships');
        setMyMemberships(memRes.data);
      } catch (e) {
        // fallback: if endpoint doesn't exist yet, leave empty
        setMyMemberships([]);
      }
    } catch (error) {
      console.error('Failed to fetch clubs', error);
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
