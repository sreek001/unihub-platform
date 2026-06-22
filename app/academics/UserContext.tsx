'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  branch: string;
  currentSemester: number;
}

interface UserContextType {
  activeUser: User | null;
  users: User[];
  setActiveUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          if (data.length > 0) {
            const saved = localStorage.getItem('unihub_active_user');
            const found = data.find((u: User) => u.id === saved);
            setActiveUserState(found || data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const setActiveUser = (user: User) => {
    setActiveUserState(user);
    localStorage.setItem('unihub_active_user', user.id);
  };

  return (
    <UserContext.Provider value={{ activeUser, users, setActiveUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useActiveUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useActiveUser must be used within a UserProvider');
  }
  return context;
}
