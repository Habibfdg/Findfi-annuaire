import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOutils, getOutilParSlug } from "@/lib/notion";
import Etoiles from "../../components/Etoiles";

export const revalidate = 300;

// Génère à l'avance une page pour chaque outil (URLs propres + rapides).
export async function generateStaticParams() {
  const outils = await getOutils();
  return outils.map((o) => ({ slug: o.slug }));
}

// SEO : title + meta description propres à chaque outil.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const outil = await getOutilParSlug(slug);
  if (!outil) return { title: "Outil introuvable — FINDFI" };
  const base = outil.description || `${outil.nom} dans l'annuaire FINDFI.`;
  return {
    title: `${outil.nom} — Avis & infos — FINDFI`,
    description: base.slice(0, 155),
  };
}

// Petit bloc "étiquette : valeurs".
function Bloc({ titre, valeurs }: { titre: string; valeurs: string[] }) {
  if (valeurs.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {titre}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {valeurs.map((v) => (
          <span
            key={v}
            className="rounded-md border border-card-border px-2.5 py-1 text-sm text-foreground/90"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function OutilPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const outil = await getOutilParSlug(slug);
  if (!outil) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/outils" className="text-sm text-muted hover:text-foreground">
        ← Retour à l&apos;annuaire
      </Link>

      {/* En-tête */}
      <header className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {outil.estTeste ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-dim px-3 py-1 text-sm font-semibold text-accent">
              ✓ Testé par FINDFI
            </span>
          ) : (
            <span className="rounded-full border border-card-border px-3 py-1 text-sm text-muted">
              Test à venir
            </span>
          )}
          {outil.estFrancais && (
            <span className="inline-flex items-center gap-1 rounded-full border border-card-border px-3 py-1 text-sm">
              🇫🇷 Outil français
            </span>
          )}
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">{outil.nom}</h1>

        {outil.estTeste && outil.score != null && (
          <div className="mt-3">
            <Etoiles score={outil.score} taille="text-xl" />
          </div>
        )}

        {outil.description && (
          <p className="mt-4 text-lg text-muted">{outil.description}</p>
        )}

        {outil.site && (
          <a
            href={outil.site}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Visiter le site officiel →
          </a>
        )}
      </header>

      {/* Verdict FINDFI — mis en avant quand il existe */}
      {outil.verdict && (
        <section className="mt-10 rounded-xl border border-accent/30 bg-accent-dim/40 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-accent">
            Le verdict FINDFI
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-foreground/95">
            {outil.verdict}
          </p>
        </section>
      )}

      {/* Infos détaillées */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <Bloc titre="Catégorie" valeurs={outil.categories} />
        <Bloc titre="Cas d'usage finance" valeurs={outil.casUsage} />
        <Bloc titre="Pour qui ?" valeurs={outil.pourQui} />
        <div className="flex flex-col gap-6">
          {outil.prix && <Bloc titre="Prix" valeurs={[outil.prix]} />}
          {outil.origine && <Bloc titre="Origine" valeurs={[outil.origine]} />}
        </div>
      </section>
    </article>
  );
}
