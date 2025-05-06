import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EventType } from '../types';

const EVENTS_COLLECTION = 'events';

// Create a new event
export const createEvent = async (event: Omit<EventType, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      date: Timestamp.fromDate(new Date(event.date)),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get all events for a user
export const getUserEvents = async (userId: string): Promise<EventType[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const events: EventType[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        date: data.date.toDate(),
        type: data.type,
        hasFundraiser: data.hasFundraiser,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        imageUrl: data.imageUrl,
      });
    });
    
    // Sort by date (ascending)
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
};

// Get a single event by id
export const getEvent = async (eventId: string): Promise<EventType | null> => {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        date: data.date.toDate(),
        type: data.type,
        hasFundraiser: data.hasFundraiser,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        imageUrl: data.imageUrl,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (
  eventId: string,
  eventData: Partial<Omit<EventType, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    
    const updateData: Record<string, any> = { ...eventData };
    
    // Convert date string to Timestamp if present
    if (eventData.date) {
      updateData.date = Timestamp.fromDate(new Date(eventData.date));
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};