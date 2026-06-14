import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
        Média indépendant · Finance × IA
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        L&apos;annuaire des outils IA pour la finance d&apos;entreprise
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        Nous testons et évaluons les solutions IA destinées aux DAF, contrôleurs
        de gestion, auditeurs et analystes financiers. Notre label{" "}
        <span className="text-accent">Testé par FINDFI</span> garantit un avis
        éditorial indépendant.
      </p>
      <Link
        href="/outils"
        className="mt-10 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Explorer l&apos;annuaire →
      </Link>
    </div>
  );
}
