// Affiche une note sur 5 sous forme d'étoiles pleines / vides.
// Si le score est null (outil non testé), n'affiche rien.
export default function Etoiles({
  score,
  taille = "text-base",
}: {
  score: number | null;
  taille?: string;
}) {
  if (score == null) return null;
  const max = 5;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${taille}`}
      aria-label={`Note FINDFI : ${score} sur ${max}`}
      title={`${score}/${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < score ? "text-accent" : "text-card-border"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}
