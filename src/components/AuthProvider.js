import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    refreshSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      if (event === 'SIGNED_IN') {
        checkNewUser(session?.user);
      }

      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const checkNewUser = async (user) => {
    const { data } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!data || data.length === 0) {
      navigate('/profile'); // new user
    } else {
      navigate('/jamstack'); // existing user
    }
  };

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
