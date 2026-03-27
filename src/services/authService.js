import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider)

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)

export const logoutUser = () => signOut(auth)
