# API Centralisée - Frontend

Ce dossier contient tous les fichiers nécessaires pour gérer les appels API de manière centralisée et éviter la répétition de code.

## Structure

```
api/
├── config.js          # Configuration axios et intercepteurs
├── authApi.js         # Fonctions d'authentification
├── tiersApi.js        # Fonctions de gestion des tiers
├── index.js           # Export centralisé
└── README.md          # Documentation
```

## Configuration (`config.js`)

Le fichier `config.js` configure une instance axios avec :
- URL de base configurable via `REACT_APP_API_URL`
- Timeout de 10 secondes
- Headers par défaut
- Intercepteurs automatiques pour :
  - Ajouter le token d'authentification
  - Gérer les erreurs 401 (redirection vers login)

## APIs Disponibles

### AuthAPI (`authApi.js`)

```javascript
import { authApi } from '../api';

// Inscription
const result = await authApi.register({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'password123'
});

// Connexion
const result = await authApi.login({
  email: 'john@example.com',
  password: 'password123'
});

// Récupération du profil
const profile = await authApi.getProfile();
```

### TiersAPI (`tiersApi.js`)

```javascript
import { tiersApi } from '../api';

// Récupérer tous les tiers
const tiers = await tiersApi.getAllTiers({
  page: 1,
  limit: 10,
  type: 'client',
  searchTerm: 'john'
});

// Récupérer par type
const clients = await tiersApi.getTiersByType('client');

// Récupérer un tiers par ID
const tier = await tiersApi.getTierById(123);

// Créer un nouveau tiers
const newTier = await tiersApi.createTier({
  nom: 'Entreprise ABC',
  email: 'contact@abc.com',
  type: 'client'
});

// Mettre à jour un tiers
const updatedTier = await tiersApi.updateTier(123, {
  nom: 'Entreprise ABC Updated'
});

// Supprimer un tiers
await tiersApi.deleteTier(123);

// Rechercher des tiers
const searchResults = await tiersApi.searchTiers('john');
```

## Utilisation

### Import

```javascript
// Import de toutes les APIs
import { authApi, tiersApi, apiClient } from '../api';

// Ou import individuel
import { authApi } from '../api/authApi';
import { tiersApi } from '../api/tiersApi';
```

### Gestion des erreurs

Toutes les fonctions API gèrent automatiquement les erreurs et retournent des messages d'erreur cohérents :

```javascript
try {
  const result = await authApi.login(credentials);
  // Succès
} catch (error) {
  // error.message contient le message d'erreur
  console.error('Erreur de connexion:', error.message);
}
```

### Authentification automatique

Le token d'authentification est automatiquement ajouté à toutes les requêtes via les intercepteurs axios. En cas d'erreur 401, l'utilisateur est automatiquement redirigé vers la page de connexion.

## Variables d'environnement

Créez un fichier `.env` dans le dossier `accounting_front` :

```env
REACT_APP_API_URL=http://localhost:5000
```

## Avantages

1. **Centralisation** : Toutes les URLs et configurations API au même endroit
2. **Réutilisabilité** : Fonctions API réutilisables dans tous les composants
3. **Maintenance** : Modification d'une URL ou d'une logique API en un seul endroit
4. **Cohérence** : Gestion d'erreurs et format de réponse uniformes
5. **Sécurité** : Gestion automatique des tokens d'authentification
6. **Type Safety** : Structure claire des paramètres et retours 