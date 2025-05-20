import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';

const AuthScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigation.replace('Swipe');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to EarTickle</Text>
      {user ? (
        <>
          <Text style={styles.userText}>Logged in as: {user.displayName}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <Button title="Sign In with Google" onPress={handleSignIn} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  userText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
  },
});

export default AuthScreen;

