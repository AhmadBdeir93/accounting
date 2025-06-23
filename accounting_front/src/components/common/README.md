# TiersAutoComplete Component

## Installation

Avant d'utiliser ce composant, vous devez installer `react-select` :

```bash
npm install react-select
```

## Utilisation

Le composant `TiersAutoComplete` est un composant de sélection avec autocomplétion pour les tiers.

### Props

- `value` (string | number): L'ID du tiers sélectionné
- `onChange` (function): Callback appelé quand la sélection change
  - Paramètres: `(tiersId, tierData)`
  - `tiersId`: L'ID du tiers sélectionné (ou null si aucun)
  - `tierData`: L'objet tiers complet (ou null si aucun)
- `placeholder` (string): Texte d'aide (défaut: "Sélectionner un tiers...")
- `isRequired` (boolean): Si le champ est obligatoire (défaut: false)
- `isDisabled` (boolean): Si le champ est désactivé (défaut: false)
- `className` (string): Classe CSS additionnelle
- `error` (string): Message d'erreur à afficher

### Exemples

#### Dans un formulaire
```jsx
import TiersAutoComplete from '../common/TiersAutoComplete';

const [selectedTiersId, setSelectedTiersId] = useState('');

const handleTiersChange = (tiersId, tierData) => {
  setSelectedTiersId(tiersId);
  console.log('Tiers sélectionné:', tierData);
};

<TiersAutoComplete
  value={selectedTiersId}
  onChange={handleTiersChange}
  placeholder="Choisir un tiers"
  isRequired={true}
/>
```

#### Dans un filtre
```jsx
<TiersAutoComplete
  value={selectedTiersId}
  onChange={handleTiersChange}
  placeholder="Filtrer par tiers"
  isRequired={false}
/>
```

## Fonctionnalités

- **Autocomplétion** : Recherche en temps réel dans les noms et types de tiers
- **Chargement automatique** : Charge automatiquement tous les tiers depuis l'API
- **Gestion d'état** : Intègre avec Redux pour la gestion des tiers
- **Styles personnalisés** : S'intègre avec le design existant
- **Accessibilité** : Support complet du clavier et lecteurs d'écran
- **Responsive** : S'adapte à toutes les tailles d'écran

## Styles

Le composant utilise des styles personnalisés qui s'intègrent avec le design existant de l'application. Les couleurs et les interactions correspondent aux autres composants. 