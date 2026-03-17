import { getServerPortalSummary } from "../../../../lib/portal-summary";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PortalCoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const summary = await getServerPortalSummary();

  const course =
    summary.authenticated
      ? summary.entitlements.flatMap((entitlement) => entitlement.courses).find((item) => item.slug === slug)
      : null;

  return (
    <main className="page-shell hero">
      <header className="topbar">
        <div>
          <div className="brand">Kursflate</div>
          <h1 className="section-title" style={{ marginTop: "0.5rem" }}>
            {course ? course.title : "Kurs ikke funnet"}
          </h1>
        </div>
        <nav className="nav">
          <a href="/portal" className="button-secondary">
            Til portal
          </a>
          <a href="/profile" className="button-secondary">
            Profil
          </a>
        </nav>
      </header>

      <section className="hero-grid">
        <article className="headline-card">
          {course ? (
            <>
              <div className="eyebrow">{course.levelCode}</div>
              <h1 className="headline" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
                {course.title}
              </h1>
              <p className="lead">{course.description}</p>
              <div className="actions">
                <a href="/portal" className="button">
                  Tilbake til pakker
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="eyebrow">Ingen tilgang</div>
              <h1 className="headline" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}>
                Kurset ble ikke funnet i dine aktive pakker.
              </h1>
              <p className="lead">
                Dette er foreløpig en enkel kursflate. Når du har tilgang til kurset via en pakke,
                kan du åpne det herfra og senere se moduler, aktiviteter og progresjon.
              </p>
              <div className="actions">
                <a href="/portal" className="button">
                  Til portal
                </a>
              </div>
            </>
          )}
        </article>

        <aside className="panel">
          <div className="kicker">Neste steg</div>
          <ul className="list">
            <li>Koble kurssiden til moduler og aktiviteter.</li>
            <li>Legg inn progresjon per aktivitet og modul.</li>
            <li>Bytt denne placeholder-flaten ut med faktisk læringsnavigasjon.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
