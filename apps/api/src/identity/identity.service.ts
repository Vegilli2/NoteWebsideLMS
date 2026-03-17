import { Injectable } from "@nestjs/common";
import { appConfig } from "../shared/app-config";
import { firebaseAdminAuth } from "../firebase/firebase-admin";

@Injectable()
export class IdentityService {
  getProviders() {
    return {
      primaryAuthProvider: "firebase-auth",
      plannedFeatures: [
        "magic-link sign-in",
        "session-cookie based web auth",
        "role claims for student, teacher, support and admin",
      ],
    };
  }

  async getFirebaseStatus() {
    await firebaseAdminAuth.getUserByEmail("definitely-not-a-real-user@example.invalid").catch((error: unknown) => {
      const firebaseError = error as { code?: string };

      if (firebaseError.code !== "auth/user-not-found") {
        throw error;
      }
    });

    return {
      status: "ok",
      projectId: appConfig.firebaseProjectId,
      credentialsPath: appConfig.firebaseAdminCredentialsPath,
      signInMode: "email-password",
      localhostReminder: "Remember to add localhost under Firebase Authentication -> Settings -> Authorized domains.",
    };
  }
}
