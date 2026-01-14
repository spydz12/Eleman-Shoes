import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import { Settings } from './types';

const DEFAULT_SETTINGS: Partial<Settings> = {
  groupName: "Edo's Footwear & Eleman Shoes",
  groupNameAr: 'إدوز فوتوير وإلمان شوز',
  primaryWhatsapp: '+213542936103',
  primaryEmail: 'contact@edoseleman.com',
  edosFootwearLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
  elemanShoesLogo: '/whatsapp_image_2026-01-14_at_01.33.33 copy.jpeg',
  heroImageUrl: '/img_20260107_145445.jpg',
  themeColor: '#b45309',
};

export async function initializeSettings(): Promise<Settings> {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      const newSettings = {
        ...DEFAULT_SETTINGS,
        id: 'general',
        updatedAt: serverTimestamp(),
      };
      await setDoc(settingsRef, newSettings);
      return newSettings as Settings;
    }

    return settingsDoc.data() as Settings;
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw error;
  }
}

export async function getSettings(): Promise<Settings | null> {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      return await initializeSettings();
    }

    return settingsDoc.data() as Settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}
