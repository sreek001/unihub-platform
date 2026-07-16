import React, { createContext, useContext, useState, useEffect } from 'react';

// 🌟 FIXED: Swapped out custom config import for dynamic environment loading + robust production fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://unihub-platform-production.up.railway.app';

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        // 🌟 FIXED: Re-routed path definition to use the verified API_URL parameter
        const res = await fetch(`${API_URL}/api/academics/students`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          if (data.length > 0) {
            const saved = localStorage.getItem('unihub_active_user');
            const found = data.find((u) => u.id === saved);
            setActiveUserState(found || data[0]);
          }
        } else {
          throw new Error(`Server responded with status: ${res.status}`);
        }
      } catch (err) {
        console.error('Failed to load users from backend, using fallbacks', err);
        // Fallback mock students matching your Supabase database seed exactly
        const mockData = [
          { id: 'anannya-20', name: 'Anannya sunny', branch: 'Computer Science', currentSemester: 6 },
          { id: 'sreehari-456', name: 'Sreehari K', branch: 'Ai and datascience', currentSemester: 4 },
          { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2 },
          { id: 'karthik-sajan', name: 'Karthik Sajan', branch: 'Mechanical Engineering', currentSemester: 4 },
          { id: 'liya-martin', name: 'Liya Martin', branch: 'Computer Science', currentSemester: 6 },
          { id: 'esther-antony', name: 'Esther Antony', branch: 'Electrical Engineering', currentSemester: 2 }
        ];
        setUsers(mockData);
        const saved = localStorage.getItem('unihub_active_user');
        const found = mockData.find((u) => u.id === saved);
        setActiveUserState(found || mockData[0]);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const setActiveUser = (user) => {
    setActiveUserState(user);
    if (user && user.id) {
      localStorage.setItem('unihub_active_user', user.id);
    }
  };

  return (
    <UserContext.Provider value={{ activeUser, users, setActiveUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useActiveUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useActiveUser must be used within a UserProvider');
  }
  return context;
}