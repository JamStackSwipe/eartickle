'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      <AuthContext.Provider value={{}}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  );
};

export const useUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(status === 'loading');

  useEffect(() => {
    setUser(session?.user || null);
    setLoading(status === 'loading');
  }, [session, status]);

  const context = useContext(AuthContext);
  if (!context) throw new Error('useUser must be within AuthProvider');

  return { user, loading };
};
