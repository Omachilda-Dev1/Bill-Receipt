import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, Timestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'invoices'

export const getInvoices = async (userId) => {
  const q = query(collection(db, COL), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const getInvoice = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) throw new Error('Invoice not found')
  return { id: snap.id, ...snap.data() }
}

export const createInvoice = async (userId, data) =>
  addDoc(collection(db, COL), {
    ...data,
    userId,
    activityLog: [{ action: 'created', status: data.status, at: new Date().toISOString() }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateInvoice = async (id, data) =>
  updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })

export const deleteInvoice = async (id) => deleteDoc(doc(db, COL, id))

export const updateInvoiceStatus = async (id, status, prevStatus) => {
  const logEntry = { action: 'status_change', from: prevStatus, to: status, at: new Date().toISOString() }
  return updateDoc(doc(db, COL, id), {
    status,
    updatedAt: serverTimestamp(),
    activityLog: arrayUnion(logEntry),
  })
}

export const duplicateInvoice = async (userId, original, newNumber) => {
  const { id, createdAt, updatedAt, invoiceNumber, activityLog, ...rest } = original
  return addDoc(collection(db, COL), {
    ...rest,
    userId,
    invoiceNumber: newNumber,
    status: 'draft',
    activityLog: [{ action: 'duplicated_from', source: invoiceNumber, at: new Date().toISOString() }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const markOverdueInvoices = async (userId) => {
  const now = Timestamp.now()
  const q = query(collection(db, COL), where('userId', '==', userId), where('status', 'in', ['sent', 'draft']))
  const snap = await getDocs(q)
  const updates = []
  snap.docs.forEach((d) => {
    const data = d.data()
    if (data.dueDate && data.dueDate.toDate() < now.toDate()) {
      updates.push(updateDoc(doc(db, COL, d.id), {
        status: 'overdue',
        updatedAt: serverTimestamp(),
        activityLog: arrayUnion({ action: 'auto_overdue', at: new Date().toISOString() }),
      }))
    }
  })
  return Promise.all(updates)
}

export const getLastInvoiceNumber = async (userId) => {
  const q = query(collection(db, COL), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data().invoiceNumber || null
}
