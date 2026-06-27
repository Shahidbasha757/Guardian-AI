// Firebase Client configuration and structure setup
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

// Default Firebase placeholder config (User can replace this in Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-ForGuardianAIFirebaseClient",
  authDomain: "guardian-ai-presence.firebaseapp.com",
  projectId: "guardian-ai-presence",
  storageBucket: "guardian-ai-presence.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:a1b2c3d4e5f6g7h8i9j0"
};

let app = null;
let db = null;
let isFirebaseConnected = false;

// Safe Firebase initialization
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseConnected = true;
  console.log("[Firebase] Client successfully initialized in sandbox environment.");
} catch (error) {
  console.warn("[Firebase] Initialization error. Running in local fallback database mode.", error);
}

// Local storage collection simulator (when firebase credentials are dummy or offline)
const localDatabase = {
  async add(collectionName, data) {
    const records = JSON.parse(localStorage.getItem(`db_${collectionName}`) || "[]");
    const newRecord = { id: Math.random().toString(36).substr(2, 9), ...data, createdAt: new Date().toISOString() };
    records.unshift(newRecord);
    localStorage.setItem(`db_${collectionName}`, JSON.stringify(records));
    console.info(`[Firebase Sync Fallback] Added record to ${collectionName}:`, newRecord);
    return newRecord;
  },

  async get(collectionName) {
    const records = JSON.parse(localStorage.getItem(`db_${collectionName}`) || "[]");
    return records;
  },

  async set(collectionName, docId, data) {
    localStorage.setItem(`db_${collectionName}_${docId}`, JSON.stringify(data));
    console.info(`[Firebase Sync Fallback] Set document ${docId} in ${collectionName}:`, data);
    return data;
  }
};

// DB API Services Export
export const firebaseService = {
  getIsConnected() {
    return isFirebaseConnected;
  },

  // Activities Log Collection
  async addActivity(activityRecord) {
    if (isFirebaseConnected && db) {
      try {
        const docRef = await addDoc(collection(db, "activity"), {
          ...activityRecord,
          timestamp: new Date().toISOString()
        });
        return { id: docRef.id, ...activityRecord };
      } catch (err) {
        return localDatabase.add("activity", activityRecord);
      }
    }
    return localDatabase.add("activity", activityRecord);
  },

  async getActivities() {
    if (isFirebaseConnected && db) {
      try {
        const q = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(25));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return localDatabase.get("activity");
      }
    }
    return localDatabase.get("activity");
  },

  // Security Alerts Collection
  async addAlert(alertRecord) {
    if (isFirebaseConnected && db) {
      try {
        const docRef = await addDoc(collection(db, "alerts"), {
          ...alertRecord,
          timestamp: new Date().toISOString()
        });
        return { id: docRef.id, ...alertRecord };
      } catch (err) {
        return localDatabase.add("alerts", alertRecord);
      }
    }
    return localDatabase.add("alerts", alertRecord);
  },

  // Settings Collection Sync
  async syncSettings(userId, settingsRecord) {
    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, "settings", userId), {
          ...settingsRecord,
          lastUpdated: new Date().toISOString()
        });
        return settingsRecord;
      } catch (err) {
        return localDatabase.set("settings", userId, settingsRecord);
      }
    }
    return localDatabase.set("settings", userId, settingsRecord);
  },

  // Analytics Trends Collection
  async addAnalyticsSnapshot(snapshot) {
    if (isFirebaseConnected && db) {
      try {
        const docRef = await addDoc(collection(db, "analytics"), {
          ...snapshot,
          timestamp: new Date().toISOString()
        });
        return { id: docRef.id, ...snapshot };
      } catch (err) {
        return localDatabase.add("analytics", snapshot);
      }
    }
    return localDatabase.add("analytics", snapshot);
  },

  // Security Audit Reports
  async addReport(report) {
    if (isFirebaseConnected && db) {
      try {
        const docRef = await addDoc(collection(db, "reports"), {
          ...report,
          timestamp: new Date().toISOString()
        });
        return { id: docRef.id, ...report };
      } catch (err) {
        return localDatabase.add("reports", report);
      }
    }
    return localDatabase.add("reports", report);
  },

  async getReports() {
    if (isFirebaseConnected && db) {
      try {
        const snapshot = await getDocs(collection(db, "reports"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return localDatabase.get("reports");
      }
    }
    return localDatabase.get("reports");
  }
};
