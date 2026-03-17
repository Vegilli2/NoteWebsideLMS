const featuredCourses = [
  {
    level: "B1",
    title: "B1 Intensivpakke",
    summary: "Fire moduler, interaktive øvinger, vurdering og løpende progresjon.",
  },
  {
    level: "B2",
    title: "B2 Fordypning",
    summary: "Skriftlig og muntlig trening med lærerrettede aktiviteter og karakterbok.",
  },
  {
    level: "B1 + B2",
    title: "Kombinasjonspakke",
    summary: "Salgsklar pakke som låser opp begge nivåer og samler alt i ett dashboard.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell hero">
      <header className="topbar">
        <div className="brand">NoteWebside LMS</div>
        <nav className="nav">
          <a href="#kurs">Kurs</a>
          <a href="#plattform">Plattform</a>
          <a href="/portal" className="button">
            Logg inn
          </a>
        </nav>
      </header>

      <section className="hero-grid">
        <article className="headline-card">
          <div className="eyebrow">Moodle replacement</div>
          <h1 className="headline">Selg og lever norskkurs i ett samlet LMS.</h1>
          <p className="lead">
            Dette oppsettet gir en offentlig salgsside, Stripe-basert kjøpsflyt og en læringsportal
            med CEFR-struktur, progresjon, meldinger og sikre innholdspakker.
          </p>
          <div className="actions">
            <a href="/portal" className="button">
              Åpne portal-shell
            </a>
            <a href="/login" className="button-secondary">
              Test Firebase login
            </a>
            <a href="#plattform" className="button-secondary">
              Se arkitektur
            </a>
          </div>
        </article>

        <aside className="panel">
          <div className="kicker">Kjernekapasiteter</div>
          <div className="panel-grid">
            <div className="stat-card">
              <h3>Commerce</h3>
              <p className="muted">Stripe checkout, automatiske entitlements og trial per nivå.</p>
            </div>
            <div className="stat-card">
              <h3>Learning</h3>
              <p className="muted">H5P, HTML-pakker, progresjon og vurdering i samme shell.</p>
            </div>
            <div className="stat-card">
              <h3>Support</h3>
              <p className="muted">Felles innboks, statusflyt og “jeg tar denne” for team.</p>
            </div>
            <div className="stat-card">
              <h3>Security</h3>
              <p className="muted">Sandboxed rendering, scoped API og GDPR-orientert sletting.</p>
            </div>
          </div>
        </aside>
      </section>

      <section id="kurs">
        <h2 className="section-title">Eksempel på salgskatalog</h2>
        <p className="muted">
          Landing page-strukturen er lagt opp for kursnivåer, pakker og senere Stripe checkout.
        </p>
        <div className="course-grid">
          {featuredCourses.map((course) => (
            <article className="course-card" key={course.title}>
              <span className="status-pill">{course.level}</span>
              <h3>{course.title}</h3>
              <p className="muted">{course.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="plattform" className="panel">
        <div className="kicker">Arkitektur i kode</div>
        <h2 className="section-title">Monorepo med web, API og Prisma-grunnmur</h2>
        <ul className="list">
          <li>Next.js 16 for offentlig side og læringsportal.</li>
          <li>NestJS 11 for modulær API-struktur med helse, katalog og identitet.</li>
          <li>Prisma med PostgreSQL-modeller for kurs, pakker, ordre og entitlements.</li>
          <li>Firebase Auth-klient og Admin SDK er koblet inn for lokal test på localhost.</li>
        </ul>
      </section>
    </main>
  );
}
