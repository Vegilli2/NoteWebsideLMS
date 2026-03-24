import { getServerAuthSession } from "../../lib/auth-session";
import { LogoutButton } from "../../components/logout-button";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  return (
    <main className="page-shell hero">
      <header className="topbar">
        <div className="brand">LMS-profil</div>
        <nav className="nav">
          <a href="/" className="button-secondary">
            Forside
          </a>
          <a href="/portal" className="button-secondary">
            Portal
          </a>
          {session.authenticated ? <LogoutButton /> : null}
        </nav>
      </header>

      <section className="hero-grid">
        <article className="headline-card">
          <div className="eyebrow">Session + Prisma</div>
          <h1 className="headline" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
            Lokal brukerprofil
          </h1>
          <p className="lead">
            Denne siden leser backend-sessionen din og viser om Firebase-identiteten er koblet til
            en lokal LMS-bruker i Prisma.
          </p>

          {session.authenticated ? (
            <div className="panel-grid" style={{ marginTop: "1.5rem" }}>
              <div className="stat-card">
                <div className="kicker">Firebase</div>
                <h3>{session.email ?? "Ukjent e-post"}</h3>
                <p className="muted">UID: {session.uid}</p>
              </div>

              {session.localUser.status === "synced" ? (
                <div className="stat-card">
                  <div className="kicker">Prisma bruker</div>
                  <h3>{session.localUser.fullName}</h3>
                  <p className="muted">Bruker-ID: {session.localUser.userId}</p>
                  <p className="muted">Roller: {session.localUser.roleCount}</p>
                </div>
              ) : (
                <div className="stat-card">
                  <div className="kicker">Prisma bruker</div>
                  <h3>Ikke synket</h3>
                  <p className="muted">Årsak: {session.localUser.reason}</p>
                  {session.localUser.detail ? <p className="muted">{session.localUser.detail}</p> : null}
                </div>
              )}
            </div>
          ) : (
            <div className="panel" style={{ marginTop: "1.5rem" }}>
              <div className="kicker">Ingen aktiv session</div>
              <h2>Du må logge inn først</h2>
              <p className="muted">
                Logg inn via Firebase først, så vil denne siden vise lokal LMS-bruker direkte fra
                backend-sessionen.
              </p>
              <a href="/login" className="button">
                Gå til login
              </a>
            </div>
          )}
        </article>

        <aside className="panel">
          <div className="kicker">Hva dette bekrefter</div>
          <ul className="list">
            <li>Session-cookien blir sendt med requests til appen.</li>
            <li>Next.js leser sessionen server-side via API-et.</li>
            <li>Firebase-identitet og lokal Prisma-bruker er koblet til samme profil.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
