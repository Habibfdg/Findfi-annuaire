import Link from "next/link";
import type { Outil } from "@/lib/notion";
import Etoiles from "./Etoiles";

// Une carte d'outil dans la grille de la page /outils.
export default function CarteOutil({ outil }: { outil: Outil }) {
  return (
    <Link
      href={`/outils/${outil.slug}`}
      className="group flex flex-col rounded-xl border border-card-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Ligne du haut : statut testé / à venir */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {outil.estTeste ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-dim px-2.5 py-1 text-xs font-semibold text-accent">
            ✓ Testé par FINDFI
          </span>
        ) : (
          <span className="text-xs font-medium text-muted">Test à venir</span>
        )}
        {outil.estFrancais && (
          <span
            className="text-base"
            title="Outil français"
            aria-label="Outil français"
          >
            🇫🇷
          </span>
        )}
      </div>

      {/* Nom + score */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent">
          {outil.nom}
        </h3>
      </div>
      {outil.estTeste && outil.score != null && (
        <div className="mt-1">
          <Etoiles score={outil.score} taille="text-sm" />
        </div>
      )}

      {/* Description */}
      {outil.description && (
        <p className="mt-3 line-clamp-3 text-sm text-muted">
          {outil.description}
        </p>
      )}

      {/* Badges catégories */}
      {outil.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {outil.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-md border border-card-border px-2 py-0.5 text-xs text-foreground/80"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Bas de carte : prix + origine */}
      <div className="mt-4 flex items-center gap-3 border-t border-card-border pt-3 text-xs text-muted">
        {outil.prix && <span>{outil.prix}</span>}
        {outil.prix && outil.origine && <span>·</span>}
        {outil.origine && <span>{outil.origine}</span>}
      </div>
    </Link>
  );
}
