"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseClientAuth } from "../../lib/firebase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Logger inn mot Firebase...");
    setError(null);
    setSessionInfo(null);

    try {
      const auth = getFirebaseClientAuth();
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();
      const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      if (!sessionResponse.ok) {
        throw new Error("API-et klarte ikke opprette session cookie.");
      }

      const sessionPayload = (await sessionResponse.json()) as {
        status: string;
        sessionCookieName: string;
        user: { uid: string; email: string | null };
        localUser:
          | {
              status: "synced";
              userId: string;
              email: string;
              fullName: string;
              roleCount: number;
            }
          | {
              status: "skipped";
              reason: "db_unavailable" | "missing_email";
              detail?: string;
            };
      };

      const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      const mePayload = (await meResponse.json()) as
        | {
            authenticated: true;
            uid: string;
            email: string | null;
            localUser:
              | {
                  status: "synced";
                  userId: string;
                  email: string;
                  fullName: string;
                  roleCount: number;
                }
              | {
                  status: "skipped";
                  reason: "db_unavailable" | "missing_email";
                  detail?: string;
                };
          }
        | { authenticated: false };

      const localUserMessage =
        sessionPayload.localUser.status === "synced"
          ? `Lokal LMS-bruker synket: ${sessionPayload.localUser.fullName} (${sessionPayload.localUser.email}).`
          : `Lokal LMS-bruker ikke synket ennå: ${sessionPayload.localUser.reason}${
              sessionPayload.localUser.detail ? ` (${sessionPayload.localUser.detail})` : ""
            }`;

      setStatus(
        `Innlogging OK. Firebase UID: ${credentials.user.uid}. ID token hentet (${idToken.length} tegn).`,
      );
      setSessionInfo(
        mePayload.authenticated
          ? `Backend-session opprettet i cookie "${sessionPayload.sessionCookieName}". /auth/me bekreftet bruker ${mePayload.uid}. ${localUserMessage}`
          : "Firebase-login virket, men backend-session ble ikke bekreftet.",
      );
    } catch (submitError) {
      const firebaseError = submitError as { message?: string };
      setError(firebaseError.message ?? "Innlogging feilet.");
      setStatus(null);
      setSessionInfo(null);
    }
  }

  async function handleSessionCheck() {
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      const payload = (await response.json()) as
        | {
            authenticated: true;
            uid: string;
            email: string | null;
            localUser:
              | {
                  status: "synced";
                  userId: string;
                  email: string;
                  fullName: string;
                  roleCount: number;
                }
              | {
                  status: "skipped";
                  reason: "db_unavailable" | "missing_email";
                  detail?: string;
                };
          }
        | { authenticated: false };

      setSessionInfo(
        payload.authenticated
          ? `Session er aktiv for ${payload.email ?? payload.uid}. Lokal brukerstatus: ${payload.localUser.status}.`
          : "Ingen aktiv backend-session funnet.",
      );
    } catch (sessionError) {
      const requestError = sessionError as { message?: string };
      setError(requestError.message ?? "Kunne ikke lese session-status.");
    }
  }

  async function handleLogout() {
    setError(null);

    try {
      const auth = getFirebaseClientAuth();

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      await signOut(auth);

      setStatus("Logget ut fra Firebase-klient og backend-session.");
      setSessionInfo(null);
    } catch (logoutError) {
      const requestError = logoutError as { message?: string };
      setError(requestError.message ?? "Logout feilet.");
    }
  }

  return (
    <main className="page-shell hero">
      <header className="topbar">
        <div className="brand">Firebase Test Login</div>
        <nav className="nav">
          <a href="/profile" className="button-secondary">
            Profil
          </a>
          <a href="/" className="button-secondary">
            Til forsiden
          </a>
        </nav>
      </header>

      <section className="hero-grid">
        <article className="headline-card">
          <div className="eyebrow">Lokal test</div>
          <h1 className="headline" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
            Logg inn med e-post og passord via Firebase Auth.
          </h1>
          <p className="lead">
            Denne siden logger først inn mot Firebase og oppretter deretter en `HttpOnly`
            session cookie i API-et på `localhost:4000`.
          </p>
          {status ? <p className="status-pill">{status}</p> : null}
          {sessionInfo ? <p className="muted">{sessionInfo}</p> : null}
          {error ? <p className="muted">Feil: {error}</p> : null}
        </article>

        <aside className="panel">
          <form onSubmit={handleSubmit}>
            <div className="kicker">Email/password</div>
            <h2>Testbruker</h2>
            <label className="muted" htmlFor="email">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="password">
              Passord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <button type="submit" className="button" style={{ border: 0, cursor: "pointer" }}>
              Logg inn
            </button>
            <div className="actions">
              <a href="/profile" className="button-secondary">
                Åpne profil
              </a>
              <button
                type="button"
                className="button-secondary"
                style={{ cursor: "pointer" }}
                onClick={handleSessionCheck}
              >
                Sjekk session
              </button>
              <button
                type="button"
                className="button-secondary"
                style={{ cursor: "pointer" }}
                onClick={handleLogout}
              >
                Logg ut
              </button>
            </div>
          </form>
        </aside>
      </section>
    </main>
  );
}
