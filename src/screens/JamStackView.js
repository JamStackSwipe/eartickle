
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

const JamStackView = () => {
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamstack = async () => {
      if (!auth.currentUser) return;

      try {
        const jamRef = collection(db, "users", auth.currentUser.uid, "jamstack");
        const snapshot = await getDocs(jamRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJamstack(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading JamStack:", error);
      }
    };

    fetchJamstack();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading your JamStack...</Text>
      </View>
    );
  }

  if (!jamstack.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your JamStack is empty. Start swiping!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your JamStack</Text>
      <FlatList
        data={jamstack}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.cover }} style={styles.image} />
            <Text style={styles.songTitle}>{item.title}</Text>
            <Text style={styles.artist}>by {item.artist}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 10,
    marginBottom: 10,
  },
  songTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  artist: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default JamStackView;
