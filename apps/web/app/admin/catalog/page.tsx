import { CatalogAdminClient } from "./catalog-admin-client";
import { getServerAdminCatalogOverview } from "../../../lib/admin-catalog";

export default async function AdminCatalogPage() {
  const overview = await getServerAdminCatalogOverview();

  return (
    <main className="page-shell hero">
      <header className="topbar">
        <div>
          <div className="brand">Admin Catalog</div>
          <h1 className="section-title" style={{ marginTop: "0.5rem" }}>
            Opprett nivå, kurs og pakker
          </h1>
        </div>
        <nav className="nav">
          <a href="/portal" className="button-secondary">
            Portal
          </a>
          <a href="/profile" className="button-secondary">
            Profil
          </a>
        </nav>
      </header>

      <section className="panel" style={{ marginBottom: "1rem" }}>
        <div className="kicker">Dev mode</div>
        <p className="muted">
          Denne første adminflyten er bevisst enkel og uten rolle-guard ennå. Målet er å opprette
          første katalogdata lokalt, slik at vi kan se ekte kurs og pakker i portalen.
        </p>
      </section>

      <CatalogAdminClient overview={overview} />
    </main>
  );
}
