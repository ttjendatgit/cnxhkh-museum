import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

/**
 * Placeholder Firebase configuration. Every value below is a placeholder —
 * NOT a real credential. Before connecting to a real project, set these as
 * environment variables (e.g. in a `.env.local` Vite reads at build time):
 *
 *   VITE_FIREBASE_API_KEY=...
 *   VITE_FIREBASE_AUTH_DOMAIN=...
 *   VITE_FIREBASE_DATABASE_URL=...
 *   VITE_FIREBASE_PROJECT_ID=...
 *   VITE_FIREBASE_STORAGE_BUCKET=...
 *   VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *   VITE_FIREBASE_APP_ID=...
 *
 * Until those are set, `isFirebaseConfigured()` returns false and
 * `gameService.ts` automatically falls back to the in-memory mock backend
 * (see mockBackend.ts) — nothing in this module ever ships or requires a
 * real credential to run/test locally.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'PLACEHOLDER_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'PLACEHOLDER_PROJECT.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://PLACEHOLDER_PROJECT-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'PLACEHOLDER_PROJECT',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'PLACEHOLDER_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:000000000000:web:0000000000000000000000',
}

/** The database node holding every competition: `gameRooms/{roomId}` (see roomSchema.ts
 * for the layout, room.ts for how the roomId is chosen). */
export const GAME_ROOMS_ROOT = 'gameRooms'

export function isFirebaseConfigured(): boolean {
  return !firebaseConfig.apiKey.startsWith('PLACEHOLDER') && !firebaseConfig.databaseURL.includes('PLACEHOLDER')
}

let app: FirebaseApp | null = null
let db: Database | null = null

/** Lazily initializes and returns the Realtime Database handle. Throws with
 * a clear message if real config hasn't been provided yet — callers should
 * check `isFirebaseConfigured()` first (gameService.ts does this for you). */
export function getFirebaseDb(): Database {
  if (!isFirebaseConfigured()) {
    throw new Error(
      '[final-game] Firebase is not configured. Set the VITE_FIREBASE_* environment variables, or use services/gameService.ts, which falls back to the mock backend automatically.',
    )
  }
  if (!app) app = initializeApp(firebaseConfig)
  if (!db) db = getDatabase(app)
  return db
}
