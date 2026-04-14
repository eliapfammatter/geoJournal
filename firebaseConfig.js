import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCGLv0b3eZ49gh4onRaKTphdsPtp7q18VY',
  authDomain: 'geojournal-a5fe2.firebaseapp.com',
  projectId: 'geojournal-a5fe2',
  storageBucket: 'geojournal-a5fe2.firebasestorage.app',
  messagingSenderId: '1017345910206',
  appId: '1:1017345910206:web:b925023331a1e40629c5ef',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
