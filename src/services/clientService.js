import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'clients'

export const getClients = async (userId) => {
  const q = query(collection(db, COL), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addClient = async (userId, data) => {
  return addDoc(collection(db, COL), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  })
}

export const updateClient = async (id, data) => {
  return updateDoc(doc(db, COL, id), data)
}

export const deleteClient = async (id) => {
  return deleteDoc(doc(db, COL, id))
}

export const clientHasInvoices = async (userId, clientId) => {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    where('clientId', '==', clientId)
  )
  const snap = await getDocs(q)
  return !snap.empty
}
