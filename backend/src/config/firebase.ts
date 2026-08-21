import { getApps, initializeApp, cert } from "firebase-admin/app";
import { env } from "./env.js";

const credentialJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
export const firebaseApp = getApps()[0] ?? (credentialJson ? initializeApp({ credential: cert(JSON.parse(credentialJson)) }) : null);
export const firebaseConfigured = Boolean(firebaseApp) || env.nodeEnv === "test";
