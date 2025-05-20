
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [cover, setCover] = useState('');

  const handleSubmit = async () => {
    if (!title || !artist || !cover) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'songs'), {
        title,
        artist,
        cover
      });
      Alert.alert('Success', 'Song uploaded to Firestore!');
      setTitle('');
      setArtist('');
      setCover('');
    } catch (error) {
      console.error('Error adding song:', error);
      Alert.alert('Error', 'Could not upload song');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a Song</Text>
      <TextInput
        style={styles.input}
        placeholder="Song Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Artist Name"
        placeholderTextColor="#888"
        value={artist}
        onChangeText={setArtist}
      />
      <TextInput
        style={styles.input}
        placeholder="Cover Image URL"
        placeholderTextColor="#888"
        value={cover}
        onChangeText={setCover}
      />
      <Button title="Upload Song" onPress={handleSubmit} color="#1e90ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#444',
    borderWidth: 1,
  },
});

export default UploadScreen;
