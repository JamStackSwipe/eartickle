import React, { useState } from 'react';
import { supabase } from '../supabase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    setMessage('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Check your email for the confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Logged in successfully!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button onClick={handleAuth} style={{ width: '100%', padding: '0.5rem' }}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </button>
      <p style={{ marginTop: '1rem' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsSignUp(!isSignUp)} style={{ color: 'blue', background: 'none', border: 'none', padding: 0 }}>
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
};

export default LoginScreen;
