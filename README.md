# FINDFI — Annuaire

Annuaire des outils IA pour la finance d'entreprise, alimenté par Notion et déployé sur Netlify.

## Prérequis

Installez [Node.js LTS](https://nodejs.org/) (version 20 ou plus).

## Démarrage local

1. Copiez `.env.example` en `.env` et remplissez vos clés Notion.
2. Installez les dépendances :

```bash
npm install
```

3. Lancez le serveur de développement :

```bash
npm run dev
```

4. Ouvrez [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Description |
|---|---|
| `NOTION_API_KEY` | Clé secrète de l'intégration Notion |
| `NOTION_DATABASE_ID` | ID de la base de données Notion |

Ces variables ne doivent **jamais** être commitées. Le fichier `.env` est exclu par `.gitignore`.

## Déploiement Netlify (étape 7)

Dans Netlify → Site settings → Environment variables, ajoutez les mêmes deux variables.
