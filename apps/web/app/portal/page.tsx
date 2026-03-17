import { getServerPortalSummary } from "../../lib/portal-summary";

export default async function PortalPage() {
  const summary = await getServerPortalSummary();

  return (
    <main className="page-shell">
      <header className="topbar portal-header">
        <div>
          <div className="brand">Studentportal</div>
          <h1 className="section-title" style={{ marginTop: "0.5rem" }}>
            Oversikt over kjøpte pakker og neste steg
          </h1>
        </div>
        <nav className="nav">
          <a href="/profile" className="button-secondary">
            Profil
          </a>
          <a href="/" className="button-secondary">
            Til offentlig side
          </a>
        </nav>
      </header>

      <section className="portal-grid">
        <article className="panel">
          <div className="kicker">Studentdashboard</div>
          {summary.authenticated ? (
            <>
              <h2>
                {summary.localUser.status === "synced"
                  ? `Hei, ${summary.localUser.fullName}`
                  : "Innlogget bruker"}
              </h2>
              <p className="muted">
                {summary.firebase.email ?? summary.firebase.uid}
              </p>
              <div className="panel-grid">
                <div className="stat-card">
                  <div className="kicker">Pakker</div>
                  <h3>{summary.stats.activePackages}</h3>
                  <p className="muted">Aktive pakker i portalen</p>
                </div>
                <div className="stat-card">
                  <div className="kicker">Kurs</div>
                  <h3>{summary.stats.activeCourses}</h3>
                  <p className="muted">Tilknyttede kurs gjennom aktive pakker</p>
                </div>
              </div>

              {summary.entitlements.length > 0 ? (
                <div className="course-grid" style={{ marginBottom: 0 }}>
                  {summary.entitlements.map((entitlement) => (
                    <article className="course-card" key={entitlement.id}>
                      <span className="status-pill">{entitlement.levelCode}</span>
                      <h3>{entitlement.title}</h3>
                      <p className="muted">{entitlement.description}</p>
                      <p className="muted">Tilgangstype: {entitlement.sourceType}</p>
                      <p className="muted">Kurs i pakken: {entitlement.courseCount}</p>
                      <p className="muted">
                        Lærerhjelp: {entitlement.teacherHelpEnabled ? "Ja" : "Nei"}
                      </p>
                      <p className="muted">
                        Kursbevis: {entitlement.certificateEnabled ? "Ja" : "Nei"}
                      </p>
                      {entitlement.courses.length > 0 ? (
                        <div className="panel" style={{ marginTop: "1rem" }}>
                          <div className="kicker">Kurs i pakken</div>
                          <ul className="list">
                            {entitlement.courses.map((course) => (
                              <li key={course.id}>
                                <a href={`/portal/courses/${course.slug}`}>{course.title}</a>
                              </li>
                            ))}
                          </ul>
                          <a
                            href={`/portal/courses/${entitlement.courses[0]?.slug ?? ""}`}
                            className="button-secondary"
                          >
                            Fortsett
                          </a>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="panel" style={{ marginTop: "1rem" }}>
                  <div className="kicker">Ingen pakker ennå</div>
                  <h3>Portalen er koblet til backend, men brukeren har ingen entitlements ennå.</h3>
                  <p className="muted">
                    Neste steg er å opprette første pakke og tildele eller kjøpe den, så vil den dukke
                    opp her automatisk.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="panel">
              <div className="kicker">Ingen aktiv session</div>
              <h2>Logg inn for å åpne portalen</h2>
              <p className="muted">
                Portalen leser ekte session-data fra backend. Logg inn først, så henter den lokal
                bruker og eventuelle pakker automatisk.
              </p>
              <a href="/login" className="button">
                Gå til login
              </a>
            </div>
          )}
        </article>

        <aside className="panel">
          <div className="kicker">Konto og tilgang</div>
          {summary.authenticated ? (
            <>
              <h2>Sessionstatus</h2>
              <ul className="list">
                <li>Firebase UID: {summary.firebase.uid}</li>
                <li>E-post: {summary.firebase.email ?? "Ukjent"}</li>
                <li>
                  Lokal bruker:{" "}
                  {summary.localUser.status === "synced"
                    ? `${summary.localUser.fullName} (${summary.localUser.userId})`
                    : "Ikke synket"}
                </li>
                <li>
                  Roller:{" "}
                  {summary.localUser.status === "synced"
                    ? summary.localUser.roles.join(", ") || "Ingen"
                    : "Ingen"}
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2>Ikke innlogget</h2>
              <p className="muted">
                Denne siden er nå koblet til backend. Når du logger inn, vil den hente ekte bruker-
                og tilgangsdata.
              </p>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
