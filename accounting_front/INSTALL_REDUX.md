# Installation de Redux

Pour utiliser les fonctionnalités Redux dans ce projet, vous devez installer les dépendances nécessaires.

## Installation des dépendances

Exécutez la commande suivante dans le dossier `accounting_front` :

```bash
npm install @reduxjs/toolkit react-redux
```

## Vérification de l'installation

Après l'installation, vérifiez que les dépendances sont bien ajoutées dans `package.json` :

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    // ... autres dépendances
  }
}
```

## Démarrage de l'application

Une fois les dépendances installées, vous pouvez démarrer l'application :

```bash
npm start
```

## Fonctionnalités disponibles

Après l'installation, vous aurez accès à :

1. **Gestion des tiers** - CRUD complet pour les clients et fournisseurs
2. **Recherche et filtres** - Recherche par nom et filtrage par type
3. **Pagination** - Navigation entre les pages de résultats
4. **Gestion d'état centralisée** - Tous les états gérés par Redux
5. **Interface utilisateur moderne** - Design responsive et intuitif

## Structure des composants

- `src/store/` - Configuration Redux
- `src/components/Tiers/` - Composants pour la gestion des tiers
- `src/hooks/` - Hooks personnalisés pour Redux

## Utilisation

1. Connectez-vous à l'application
2. Naviguez vers "Tiers" dans le menu
3. Utilisez les fonctionnalités de création, modification, suppression et recherche

## Support

En cas de problème, vérifiez :
- Que toutes les dépendances sont installées
- Que l'API backend est en cours d'exécution
- Les logs de la console pour les erreurs 