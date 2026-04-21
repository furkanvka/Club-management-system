import React, { createContext, useContext, useState, useEffect } from 'react';
import { clubService } from '../services/clubService';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [activeClub, setActiveClub] = useState(null);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await clubService.getAllClubs();
        setClubs(data);
      } catch (error) {
        console.error('Failed to fetch clubs', error);
      }
    };
    fetchClubs();
  }, []);

  const selectClub = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    setActiveClub(club);
  };

  return (
    <ClubContext.Provider value={{ clubs, activeClub, selectClub, setClubs }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => useContext(ClubContext);
