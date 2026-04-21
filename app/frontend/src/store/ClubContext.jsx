import React, { createContext, useContext, useState, useEffect } from 'react';
import { clubService } from '../services/clubService';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [activeClub, setActiveClub] = useState(null);
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);

  const refreshClubs = async () => {
    try {
      const [myData, allData] = await Promise.all([
        clubService.getMyClubs(),
        clubService.getAllClubs()
      ]);
      setMyClubs(myData);
      setAllClubs(allData);
    } catch (error) {
      console.error('Failed to fetch clubs', error);
    }
  };

  useEffect(() => {
    refreshClubs();
  }, []);

  const selectClub = (club) => {
    setActiveClub(club);
  };

  return (
    <ClubContext.Provider value={{ myClubs, allClubs, activeClub, selectClub, refreshClubs }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
