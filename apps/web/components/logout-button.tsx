"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseClientAuth } from "../lib/firebase-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      await signOut(getFirebaseClientAuth()).catch(() => undefined);
      router.refresh();
      router.push("/login");
    }
  }

  return (
    <button
      type="button"
      className="button-secondary"
      style={{ cursor: "pointer" }}
      onClick={handleLogout}
    >
      Logg ut
    </button>
  );
}
