import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { appConfig } from "../shared/app-config";

function readServiceAccount() {
  if (appConfig.firebaseAdminCredentialsJson) {
    return JSON.parse(appConfig.firebaseAdminCredentialsJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  const credentialsPath = resolve(appConfig.firebaseAdminCredentialsPath);
  const raw = readFileSync(credentialsPath, "utf-8");

  return JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = readServiceAccount();

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

export const firebaseAdminApp = getFirebaseAdminApp();
export const firebaseAdminAuth = getAuth(firebaseAdminApp);
