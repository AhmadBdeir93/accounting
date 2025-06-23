# Redux Store - Gestion d'état

Ce dossier contient la configuration Redux pour la gestion d'état de l'application de comptabilité.

## Structure

```
store/
├── index.js              # Configuration du store Redux
├── slices/
│   └── tiersSlice.js     # Slice pour la gestion des tiers
└── README.md             # Ce fichier
```

## Configuration

### Store Principal (`index.js`)
- Configuration du store Redux avec `configureStore`
- Intégration des reducers
- Configuration du middleware

### Slices

#### Tiers Slice (`tiersSlice.js`)
Gère l'état des tiers (clients et fournisseurs) avec les fonctionnalités suivantes :

**Actions asynchrones :**
- `fetchAllTiers` - Récupérer tous les tiers
- `fetchTiersByType` - Récupérer les tiers par type (client/fournisseur)
- `fetchTierById` - Récupérer un tiers par ID
- `createTier` - Créer un nouveau tiers
- `updateTier` - Mettre à jour un tiers
- `deleteTier` - Supprimer un tiers
- `searchTiers` - Rechercher des tiers

**Actions synchrones :**
- `clearError` - Effacer les erreurs
- `clearCurrentTier` - Effacer le tiers actuel
- `setFilters` - Définir les filtres
- `clearFilters` - Effacer les filtres
- `setPagination` - Définir la pagination

**État :**
```javascript
{
  tiers: [],              // Liste des tiers
  currentTier: null,      // Tiers actuellement sélectionné
  loading: false,         // État de chargement
  error: null,           // Erreurs
  searchResults: [],     // Résultats de recherche
  filters: {             // Filtres actifs
    type: null,
    searchTerm: ''
  },
  pagination: {          // Pagination
    page: 1,
    limit: 10,
    total: 0
  }
}
```

## Utilisation

### Hooks personnalisés
```javascript
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';

// Dans un composant
const dispatch = useAppDispatch();
const { tiers, loading, error } = useAppSelector(state => state.tiers);
```

### Dispatch d'actions
```javascript
// Charger tous les tiers
dispatch(fetchAllTiers());

// Créer un nouveau tiers
dispatch(createTier(tierData));

// Rechercher des tiers
dispatch(searchTiers({ searchTerm: 'recherche', params: {} }));
```

### Sélection d'état
```javascript
// Récupérer l'état des tiers
const tiersState = useAppSelector(state => state.tiers);

// Récupérer seulement la liste des tiers
const tiers = useAppSelector(state => state.tiers.tiers);

// Récupérer l'état de chargement
const loading = useAppSelector(state => state.tiers.loading);
```

## Intégration avec l'API

Le slice tiers utilise l'API définie dans `src/api/tiersApi.js` pour toutes les opérations CRUD :

- **GET** `/tiers` - Récupérer tous les tiers
- **GET** `/tiers/type/:type` - Récupérer les tiers par type
- **GET** `/tiers/:id` - Récupérer un tiers par ID
- **POST** `/tiers` - Créer un nouveau tiers
- **PUT** `/tiers/:id` - Mettre à jour un tiers
- **DELETE** `/tiers/:id` - Supprimer un tiers

## Gestion des erreurs

Les erreurs sont automatiquement gérées par les actions asynchrones et stockées dans l'état `error`. Elles peuvent être effacées avec l'action `clearError`.

## Pagination

La pagination est gérée automatiquement avec les paramètres `page` et `limit`. L'état de pagination est mis à jour à chaque requête.

## Filtres

Les filtres permettent de :
- Filtrer par type (client/fournisseur)
- Rechercher par terme
- Combiner plusieurs filtres

Les filtres sont persistés dans l'état Redux et peuvent être effacés avec `clearFilters`. 