# Dashboard privé

Accès : `/dashboard`. Seul l'utilisateur Discord `155715022192902144` est autorisé, via `ADMIN_DISCORD_ID` côté serveur. Sans configuration valide, aucun accès ni aucune écriture n'est possible.

## Configuration

1. Dans le [portail développeur Discord](https://discord.com/developers/applications), créez une application OAuth (ou utilisez une application dont vous êtes propriétaire).
2. Dans OAuth2, ajoutez `http://localhost:3000/api/auth/callback/discord` pour le développement et `https://hydroxios.fr/api/auth/callback/discord` pour ce domaine en production. Adaptez le domaine si nécessaire.
3. Renseignez `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET` dans `.env.local`. Ce fichier est ignoré par Git. Un secret de session aléatoire est préparé localement ; chaque déploiement doit avoir son propre `NEXTAUTH_SECRET` (32 octets aléatoires minimum).
4. En production, définissez `NEXTAUTH_URL` sur l'origine HTTPS réelle, sans `/dashboard`. Redémarrez le serveur après modification des variables d'environnement.

Le bot n'a pas besoin d'être invité : seule la permission OAuth `identify` est demandée. L'identifiant de l'application OAuth et l'identifiant de l'utilisateur autorisé sont deux valeurs différentes. Implémentation basée sur [NextAuth et son fournisseur Discord](https://next-auth.js.org/providers/discord).

## Stockage et déploiement

Le dashboard modifie les mêmes fichiers JSON que le site et préserve leurs champs inconnus. Utilisez un serveur Node.js avec disque persistant, une instance d'écriture et des permissions de fichiers limitées à l'utilisateur du service. Définissez `CATALOG_DATA_DIR` pour séparer les catalogues du code déployé ; copiez les trois JSON existants dans ce répertoire avant le premier démarrage. N'exposez jamais ce dossier comme répertoire de fichiers statiques.

Un hébergement à disque éphémère ou en lecture seule ne convient pas à cette version. Les API publiques restent en lecture seule. N'utilisez pas l'éditeur natif en parallèle avec les écritures du dashboard.

Chaque sauvegarde valide les données, compare la révision, prend un verrou et remplace le JSON par renommage. L'ancienne version est conservée dans `.catalog-private/`. Prévoyez une rétention de ces sauvegardes. Après un arrêt brutal, un fichier `.lock` peut subsister : arrêter toutes les instances avant de retirer uniquement ce verrou et de redémarrer.

Les sessions durent huit heures. L'autorisation est contrôlée sur la page et chaque requête API. Les écritures exigent la même origine et un en-tête personnalisé ; les sessions OAuth et leur protection CSRF sont gérées par NextAuth. Changer `ADMIN_DISCORD_ID` puis redémarrer retire immédiatement l'accès à l'ancien compte ; changer `NEXTAUTH_SECRET` invalide toutes les sessions.

## Vérification

`npm test`, `npm run lint`, `npm run build`. Tester également la vraie connexion avec le compte autorisé et le refus d'un autre compte après configuration OAuth. Les tests locaux n'effectuent pas de connexion Discord réelle.
