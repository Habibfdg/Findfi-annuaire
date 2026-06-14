import type { Metadata } from "next";
import { getOutils } from "@/lib/notion";
import OutilsClient from "./OutilsClient";

export const metadata: Metadata = {
  title: "Annuaire des outils IA finance — FINDFI",
  description:
    "Découvrez et comparez les outils IA pour la finance d'entreprise. Filtres par catégorie, cas d'usage, métier, prix et origine. Avis indépendants Testé par FINDFI.",
};

// On redemande les données à Notion au maximum toutes les 5 minutes.
export const revalidate = 300;

export default async function OutilsPage() {
  const outils = await getOutils();
  return <OutilsClient outils={outils} />;
}
