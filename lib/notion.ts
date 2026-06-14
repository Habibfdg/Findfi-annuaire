/* eslint-disable @typescript-eslint/no-explicit-any */
// Ce fichier lit le JSON brut renvoyé par l'API Notion, dont la forme varie
// selon le type de colonne. On utilise donc volontairement le type "any".
import { Client } from "@notionhq/client";

// On se connecte à Notion avec la clé rangée dans .env (jamais sur GitHub).
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dataSourceId = process.env.NOTION_DATA_SOURCE_ID!;

// La "forme" d'un outil, une fois rangé proprement pour notre site.
export type Outil = {
  id: string;
  slug: string; // URL propre, ex: "mon-outil"
  nom: string;
  site: string | null;
  description: string;
  categories: string[];
  casUsage: string[];
  pourQui: string[];
  statut: string | null; // "A TESTER" | "Testé"
  estTeste: boolean;
  score: number | null; // null si pas encore testé
  origine: string | null; // FRANCE | EUROPE | USA
  estFrancais: boolean;
  prix: string | null; // Payant | Freemium | Gratuit
  verdict: string | null; // null si pas encore testé
};

// Normalise un nom de colonne : minuscules, sans accents, sans espaces ni
// ponctuation. Ainsi "Pour qui ? " et "Cas d'usage finance" (apostrophe
// typographique) sont retrouvés de façon fiable malgré les pièges de saisie.
function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^a-z0-9]/g, ""); // espaces, apostrophes, "?", etc.
}

// Retrouve une colonne par son nom "lisible", quelle que soit sa saisie exacte.
function colonne(props: any, nomLisible: string): any {
  const cible = normaliser(nomLisible);
  const cle = Object.keys(props).find((k) => normaliser(k) === cible);
  return cle ? props[cle] : undefined;
}

// --- Petits outils pour lire chaque type de colonne Notion sans planter ---
// (Notion renvoie une structure différente selon le type de colonne.)

function lireTitre(prop: any): string {
  return prop?.title?.map((t: any) => t.plain_text).join("") ?? "";
}

function lireTexte(prop: any): string {
  return prop?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
}

function lireUrl(prop: any): string | null {
  return prop?.url || null;
}

function lireSelect(prop: any): string | null {
  return prop?.select?.name ?? null;
}

// Le "Statut Findfi" est de type "status" (différent d'un "select").
function lireStatus(prop: any): string | null {
  return prop?.status?.name ?? null;
}

function lireMultiSelect(prop: any): string[] {
  return prop?.multi_select?.map((o: any) => o.name) ?? [];
}

// Le Score est un "select" (ex: "⭐⭐⭐⭐" ou "4" ou "4/5"). On gère ces cas,
// et on renvoie null si la case est vide (outil non encore testé).
function lireScore(prop: any): number | null {
  if (!prop) return null;
  if (prop.type === "number") return prop.number ?? null;
  const nom: string = prop.select?.name ?? prop.status?.name ?? "";
  if (!nom) return null;
  // Compte tout symbole "étoile" (★, ☆, ⭐, ✦…), quel que soit celui utilisé.
  const etoiles = Array.from(nom).filter(
    (c) => (c.codePointAt(0) ?? 0) >= 0x2600
  ).length;
  if (etoiles > 0) return etoiles;
  const chiffre = parseInt(nom, 10); // "4" ou "4/5"
  return Number.isNaN(chiffre) ? null : chiffre;
}

// Transforme un nom en "slug" pour l'URL : "Mon Outil !" -> "mon-outil"
function fabriquerSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "-") // tout le reste -> tiret
    .replace(/^-+|-+$/g, ""); // pas de tiret au début/fin
}

// Transforme une "page" Notion brute en un Outil propre pour notre site.
function transformer(page: any): Outil {
  const p = page.properties;
  const nom = lireTitre(colonne(p, "Nom de l'entreprise"));
  const statut = lireStatus(colonne(p, "Statut Findfi"));
  const origine = lireSelect(colonne(p, "Origine"));

  return {
    id: page.id,
    slug: fabriquerSlug(nom) || page.id,
    nom,
    site: lireUrl(colonne(p, "Site officiel")),
    description: lireTexte(colonne(p, "Description courte")),
    categories: lireMultiSelect(colonne(p, "Catégorie principale")),
    casUsage: lireMultiSelect(colonne(p, "Cas d'usage finance")),
    pourQui: lireMultiSelect(colonne(p, "Pour qui ?")),
    statut,
    estTeste: statut !== null && normaliser(statut) === "teste",
    score: lireScore(colonne(p, "Score Findfi")),
    origine,
    estFrancais: origine === "FRANCE",
    prix: lireSelect(colonne(p, "Prix")),
    verdict: lireTexte(colonne(p, "Verdict Findfi")) || null,
  };
}

// Récupère TOUS les outils de la base (en gérant la pagination de Notion).
export async function getOutils(): Promise<Outil[]> {
  const resultats: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const reponse: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
    });
    resultats.push(...reponse.results);
    cursor = reponse.has_more ? (reponse.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return resultats.map(transformer);
}

// Récupère un seul outil à partir de son slug (pour la page détail).
export async function getOutilParSlug(slug: string): Promise<Outil | null> {
  const outils = await getOutils();
  return outils.find((o) => o.slug === slug) ?? null;
}
