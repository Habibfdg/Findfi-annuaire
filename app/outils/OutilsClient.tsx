"use client";

import { useMemo, useState } from "react";
import type { Outil } from "@/lib/notion";
import CarteOutil from "../components/CarteOutil";

// Récupère toutes les valeurs uniques d'un champ multi-select, triées.
function valeursUniques(outils: Outil[], champ: (o: Outil) => string[]): string[] {
  const set = new Set<string>();
  outils.forEach((o) => champ(o).forEach((v) => set.add(v)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

// Idem pour un champ simple (select).
function valeursUniquesSimple(
  outils: Outil[],
  champ: (o: Outil) => string | null
): string[] {
  const set = new Set<string>();
  outils.forEach((o) => {
    const v = champ(o);
    if (v) set.add(v);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

// Un groupe de filtres (cases à cocher) dans la colonne de gauche.
function GroupeFiltre({
  titre,
  options,
  selection,
  onToggle,
}: {
  titre: string;
  options: string[];
  selection: Set<string>;
  onToggle: (valeur: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="border-b border-card-border py-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {titre}
      </h3>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground/90 hover:text-foreground"
          >
            <input
              type="checkbox"
              checked={selection.has(opt)}
              onChange={() => onToggle(opt)}
              className="h-4 w-4 accent-accent"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function OutilsClient({ outils }: { outils: Outil[] }) {
  const [recherche, setRecherche] = useState("");
  const [testesUniquement, setTestesUniquement] = useState(false);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [casUsage, setCasUsage] = useState<Set<string>>(new Set());
  const [pourQui, setPourQui] = useState<Set<string>>(new Set());
  const [prix, setPrix] = useState<Set<string>>(new Set());
  const [origine, setOrigine] = useState<Set<string>>(new Set());

  // Listes d'options calculées à partir des données Notion.
  const optCategories = useMemo(() => valeursUniques(outils, (o) => o.categories), [outils]);
  const optCasUsage = useMemo(() => valeursUniques(outils, (o) => o.casUsage), [outils]);
  const optPourQui = useMemo(() => valeursUniques(outils, (o) => o.pourQui), [outils]);
  const optPrix = useMemo(() => valeursUniquesSimple(outils, (o) => o.prix), [outils]);
  const optOrigine = useMemo(() => valeursUniquesSimple(outils, (o) => o.origine), [outils]);

  // Bascule une valeur dans un ensemble de filtres.
  function basculer(setter: (s: Set<string>) => void, set: Set<string>, valeur: string) {
    const copie = new Set(set);
    if (copie.has(valeur)) {
      copie.delete(valeur);
    } else {
      copie.add(valeur);
    }
    setter(copie);
  }

  // Un outil passe le filtre si TOUS les groupes actifs correspondent.
  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return outils.filter((o) => {
      if (testesUniquement && !o.estTeste) return false;
      if (q && !(o.nom.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)))
        return false;
      if (categories.size && !o.categories.some((c) => categories.has(c))) return false;
      if (casUsage.size && !o.casUsage.some((c) => casUsage.has(c))) return false;
      if (pourQui.size && !o.pourQui.some((c) => pourQui.has(c))) return false;
      if (prix.size && !(o.prix && prix.has(o.prix))) return false;
      if (origine.size && !(o.origine && origine.has(o.origine))) return false;
      return true;
    });
  }, [outils, recherche, testesUniquement, categories, casUsage, pourQui, prix, origine]);

  const aDesFiltres =
    testesUniquement ||
    recherche ||
    categories.size ||
    casUsage.size ||
    pourQui.size ||
    prix.size ||
    origine.size;

  function reinitialiser() {
    setRecherche("");
    setTestesUniquement(false);
    setCategories(new Set());
    setCasUsage(new Set());
    setPourQui(new Set());
    setPrix(new Set());
    setOrigine(new Set());
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Annuaire des outils</h1>
        <p className="mt-2 text-muted">
          Les solutions IA pour la finance d&apos;entreprise, testées et évaluées par
          notre rédaction.
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un outil…"
          className="w-full rounded-lg border border-card-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent sm:max-w-md"
        />
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={testesUniquement}
            onChange={(e) => setTestesUniquement(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Testé par FINDFI uniquement
        </label>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Colonne de filtres */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filtres</h2>
            {aDesFiltres ? (
              <button
                onClick={reinitialiser}
                className="text-xs text-accent hover:underline"
              >
                Réinitialiser
              </button>
            ) : null}
          </div>
          <GroupeFiltre
            titre="Catégorie"
            options={optCategories}
            selection={categories}
            onToggle={(v) => basculer(setCategories, categories, v)}
          />
          <GroupeFiltre
            titre="Cas d'usage"
            options={optCasUsage}
            selection={casUsage}
            onToggle={(v) => basculer(setCasUsage, casUsage, v)}
          />
          <GroupeFiltre
            titre="Pour qui ?"
            options={optPourQui}
            selection={pourQui}
            onToggle={(v) => basculer(setPourQui, pourQui, v)}
          />
          <GroupeFiltre
            titre="Prix"
            options={optPrix}
            selection={prix}
            onToggle={(v) => basculer(setPrix, prix, v)}
          />
          <GroupeFiltre
            titre="Origine"
            options={optOrigine}
            selection={origine}
            onToggle={(v) => basculer(setOrigine, origine, v)}
          />
        </aside>

        {/* Grille de résultats */}
        <div className="flex-1">
          <p className="mb-4 text-sm text-muted">
            {resultats.length} outil{resultats.length > 1 ? "s" : ""}
          </p>
          {resultats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-card-border p-12 text-center text-muted">
              Aucun outil ne correspond à ces critères.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultats.map((o) => (
                <CarteOutil key={o.id} outil={o} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
