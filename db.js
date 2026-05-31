const DB_NAME = 'travelDB';
const DB_VERSION = 1;
const STORE_TRIPS = 'trips';

function openTravelDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_TRIPS)) {
        db.createObjectStore(STORE_TRIPS, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadTripsFromDb() {
  const db = await openTravelDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, 'readonly');
    const store = tx.objectStore(STORE_TRIPS);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function saveTripsToDb(trips) {
  const db = await openTravelDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRIPS, 'readwrite');
    const store = tx.objectStore(STORE_TRIPS);

    const clearReq = store.clear();
    clearReq.onerror = () => reject(clearReq.error);
    clearReq.onsuccess = () => {
      trips.forEach((trip) => store.put(trip));
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
