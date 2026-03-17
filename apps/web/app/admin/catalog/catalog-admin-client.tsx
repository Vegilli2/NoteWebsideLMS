"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { AdminCatalogOverview } from "../../../lib/admin-catalog";

type CatalogAdminClientProps = {
  overview: AdminCatalogOverview;
};

export function CatalogAdminClient({ overview }: CatalogAdminClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function submitJson(path: string, payload: unknown, successMessage: string) {
    setError(null);
    setStatus("Lagrer...");

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(failureText || "Request failed.");
    }

    setStatus(successMessage);
    router.refresh();
  }

  async function handleCreateLevel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      await submitJson(
        "/admin/catalog/levels",
        {
          code: String(formData.get("code")),
          title: String(formData.get("title")),
        },
        "Nivå opprettet.",
      );
      event.currentTarget.reset();
    } catch (submitError) {
      const requestError = submitError as { message?: string };
      setError(requestError.message ?? "Kunne ikke opprette nivå.");
      setStatus(null);
    }
  }

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      await submitJson(
        "/admin/catalog/courses",
        {
          levelId: String(formData.get("levelId")),
          slug: String(formData.get("slug")),
          title: String(formData.get("title")),
          description: String(formData.get("description")),
          isPublished: formData.get("isPublished") === "on",
        },
        "Kurs opprettet.",
      );
      event.currentTarget.reset();
    } catch (submitError) {
      const requestError = submitError as { message?: string };
      setError(requestError.message ?? "Kunne ikke opprette kurs.");
      setStatus(null);
    }
  }

  async function handleCreatePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedCourseIds = formData.getAll("courseIds").map(String);

    try {
      await submitJson(
        "/admin/catalog/packages",
        {
          levelId: String(formData.get("levelId")),
          slug: String(formData.get("slug")),
          title: String(formData.get("title")),
          description: String(formData.get("description")),
          teacherHelpEnabled: formData.get("teacherHelpEnabled") === "on",
          certificateEnabled: formData.get("certificateEnabled") === "on",
          trialDays: formData.get("trialDays") ? Number(formData.get("trialDays")) : undefined,
          courseIds: selectedCourseIds,
        },
        "Pakke opprettet.",
      );
      event.currentTarget.reset();
    } catch (submitError) {
      const requestError = submitError as { message?: string };
      setError(requestError.message ?? "Kunne ikke opprette pakke.");
      setStatus(null);
    }
  }

  async function handleAssignPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      await submitJson(
        "/admin/catalog/assign-package",
        {
          email: String(formData.get("email")),
          packageId: String(formData.get("packageId")),
        },
        "Pakke tildelt bruker.",
      );
    } catch (submitError) {
      const requestError = submitError as { message?: string };
      setError(requestError.message ?? "Kunne ikke tildele pakke.");
      setStatus(null);
    }
  }

  return (
    <>
      {status ? <p className="status-pill">{status}</p> : null}
      {error ? <p className="muted">Feil: {error}</p> : null}

      <section className="portal-grid" style={{ paddingBottom: "1rem" }}>
        <article className="panel">
          <div className="kicker">Opprett nivå</div>
          <h2>CEFR-nivå</h2>
          <form onSubmit={handleCreateLevel}>
            <label className="muted" htmlFor="level-code">
              Kode
            </label>
            <select
              id="level-code"
              name="code"
              defaultValue={overview.levelCodeOptions[0] ?? "B1"}
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            >
              {overview.levelCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <label className="muted" htmlFor="level-title">
              Tittel
            </label>
            <input
              id="level-title"
              name="title"
              required
              placeholder="B1 Mellomnivå"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <button type="submit" className="button" style={{ border: 0, cursor: "pointer" }}>
              Opprett nivå
            </button>
          </form>
        </article>

        <aside className="panel">
          <div className="kicker">Eksisterende nivåer</div>
          <h2>Nivåoversikt</h2>
          <ul className="list">
            {overview.levels.length > 0 ? (
              overview.levels.map((level) => (
                <li key={level.id}>
                  {level.code} - {level.title} ({level.courseCount} kurs, {level.packageCount} pakker)
                </li>
              ))
            ) : (
              <li>Ingen nivåer opprettet ennå.</li>
            )}
          </ul>
        </aside>
      </section>

      <section className="portal-grid" style={{ paddingBottom: "1rem" }}>
        <article className="panel">
          <div className="kicker">Opprett kurs</div>
          <h2>Kurs</h2>
          <form onSubmit={handleCreateCourse}>
            <label className="muted" htmlFor="course-level">
              Nivå
            </label>
            <select
              id="course-level"
              name="levelId"
              required
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            >
              <option value="">Velg nivå</option>
              {overview.levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} - {level.title}
                </option>
              ))}
            </select>
            <label className="muted" htmlFor="course-slug">
              Slug
            </label>
            <input
              id="course-slug"
              name="slug"
              required
              placeholder="b1-intensiv"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="course-title">
              Tittel
            </label>
            <input
              id="course-title"
              name="title"
              required
              placeholder="B1 Intensivkurs"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="course-description">
              Beskrivelse
            </label>
            <textarea
              id="course-description"
              name="description"
              required
              placeholder="Kort beskrivelse av kursinnholdet"
              rows={4}
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" style={{ display: "block", marginBottom: "1rem" }}>
              <input type="checkbox" name="isPublished" /> Publiser umiddelbart
            </label>
            <button type="submit" className="button" style={{ border: 0, cursor: "pointer" }}>
              Opprett kurs
            </button>
          </form>
        </article>

        <aside className="panel">
          <div className="kicker">Eksisterende kurs</div>
          <h2>Kursoversikt</h2>
          <ul className="list">
            {overview.courses.length > 0 ? (
              overview.courses.map((course) => (
                <li key={course.id}>
                  {course.levelCode} - {course.title} ({course.slug}) {course.isPublished ? "[publisert]" : "[utkast]"}
                </li>
              ))
            ) : (
              <li>Ingen kurs opprettet ennå.</li>
            )}
          </ul>
        </aside>
      </section>

      <section className="portal-grid">
        <article className="panel">
          <div className="kicker">Opprett pakke</div>
          <h2>Pakke</h2>
          <form onSubmit={handleCreatePackage}>
            <label className="muted" htmlFor="package-level">
              Nivå
            </label>
            <select
              id="package-level"
              name="levelId"
              required
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            >
              <option value="">Velg nivå</option>
              {overview.levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} - {level.title}
                </option>
              ))}
            </select>
            <label className="muted" htmlFor="package-slug">
              Slug
            </label>
            <input
              id="package-slug"
              name="slug"
              required
              placeholder="b1-startpakke"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="package-title">
              Tittel
            </label>
            <input
              id="package-title"
              name="title"
              required
              placeholder="B1 Startpakke"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="package-description">
              Beskrivelse
            </label>
            <textarea
              id="package-description"
              name="description"
              required
              placeholder="Kort beskrivelse av pakken"
              rows={4}
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="package-trial-days">
              Trial-dager
            </label>
            <input
              id="package-trial-days"
              name="trialDays"
              type="number"
              min={1}
              placeholder="7"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" style={{ display: "block", marginBottom: "0.6rem" }}>
              Kurs i pakken
            </label>
            <div className="panel" style={{ marginBottom: "1rem" }}>
              {overview.courses.length > 0 ? (
                overview.courses.map((course) => (
                  <label key={course.id} className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
                    <input type="checkbox" name="courseIds" value={course.id} /> {course.levelCode} - {course.title}
                  </label>
                ))
              ) : (
                <p className="muted">Opprett minst ett kurs før du lager pakker.</p>
              )}
            </div>
            <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
              <input type="checkbox" name="teacherHelpEnabled" defaultChecked /> Inkluder lærerhjelp
            </label>
            <label className="muted" style={{ display: "block", marginBottom: "1rem" }}>
              <input type="checkbox" name="certificateEnabled" defaultChecked /> Inkluder kursbevis
            </label>
            <button type="submit" className="button" style={{ border: 0, cursor: "pointer" }}>
              Opprett pakke
            </button>
          </form>
        </article>

        <aside className="panel">
          <div className="kicker">Eksisterende pakker</div>
          <h2>Pakkeoversikt</h2>
          <ul className="list">
            {overview.packages.length > 0 ? (
              overview.packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.levelCode} - {pkg.title} ({pkg.slug})
                  {pkg.courseTitles.length > 0 ? ` -> ${pkg.courseTitles.join(", ")}` : " -> ingen kurs koblet"}
                </li>
              ))
            ) : (
              <li>Ingen pakker opprettet ennå.</li>
            )}
          </ul>
        </aside>
      </section>

      <section className="portal-grid" style={{ paddingTop: "1rem" }}>
        <article className="panel">
          <div className="kicker">Tildel pakke</div>
          <h2>Manuell entitlement</h2>
          <form onSubmit={handleAssignPackage}>
            <label className="muted" htmlFor="assign-email">
              Brukerens e-post
            </label>
            <input
              id="assign-email"
              name="email"
              type="email"
              required
              placeholder="canyohan@yahoo.no"
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            />
            <label className="muted" htmlFor="assign-package">
              Pakke
            </label>
            <select
              id="assign-package"
              name="packageId"
              required
              style={{ width: "100%", margin: "0.4rem 0 1rem", padding: "0.8rem", borderRadius: "14px", border: "1px solid rgba(19,33,24,0.12)" }}
            >
              <option value="">Velg pakke</option>
              {overview.packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.levelCode} - {pkg.title}
                </option>
              ))}
            </select>
            <button type="submit" className="button" style={{ border: 0, cursor: "pointer" }}>
              Tildel pakke
            </button>
          </form>
        </article>

        <aside className="panel">
          <div className="kicker">Brukere</div>
          <h2>Lokale LMS-brukere</h2>
          <ul className="list">
            {overview.users.length > 0 ? (
              overview.users.map((user) => (
                <li key={user.id}>
                  {user.fullName} ({user.email})
                  {user.entitlementTitles.length > 0
                    ? ` -> ${user.entitlementTitles.join(", ")}`
                    : " -> ingen pakker"}
                </li>
              ))
            ) : (
              <li>Ingen lokale brukere ennå.</li>
            )}
          </ul>
        </aside>
      </section>
    </>
  );
}
