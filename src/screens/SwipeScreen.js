import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SwipeScreen = () => {
  const [songs, setSongs] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "songs"));
        const songList = [];
        querySnapshot.forEach((doc) => {
          songList.push({ id: doc.id, ...doc.data() });
        });
        setSongs(songList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    fetchSongs();
  }, []);

  const currentSong = songs[index];

  const handleSwipeRight = async () => {
    if (!auth.currentUser || !currentSong) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const jamstackRef = doc(db, "users", auth.currentUser.uid, "jamstack", currentSong.id);
    await setDoc(jamstackRef, currentSong);
    setIndex((prev) => (prev + 1) % songs.length);
    translateX.value = 0;
  };

  const handleSwipeLeft = () => {
    setIndex((prev) => (prev + 1) % songs.length);
    translateX.value = 0;
  };

  const panGesture = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: () => {
      if (translateX.value > 150) {
        translateX.value = withSpring(1000);
        runOnJS(handleSwipeRight)();
      } else if (translateX.value < -150) {
        translateX.value = withSpring(-1000);
        runOnJS(handleSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.text}>Loading songs...</Text>
      </View>
    );
  }

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No more songs to swipe!</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: currentSong.cover }} style={styles.image} />
          <Text style={styles.title}>{currentSong.title}</Text>
          <Text style={styles.artist}>by {currentSong.artist}</Text>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    height: 420,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 12,
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  artist: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 4,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});

export default SwipeScreen;
