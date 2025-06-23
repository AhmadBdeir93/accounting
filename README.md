# Accounting Application

Une application de comptabilité complète avec une API Node.js modulaire (MySQL) et une interface React.

## Structure du Projet

```
accounting/
├── accounting_api/          # API Node.js modulaire avec MySQL
│   ├── config/
│   │   ├── config.js        # Configuration centralisée
│   │   └── database.js      # Configuration MySQL
│   ├── controllers/
│   │   ├── authController.js    # Contrôleurs d'authentification
│   │   └── healthController.js  # Contrôleurs de santé
│   ├── middleware/
│   │   ├── authMiddleware.js    # Middleware d'authentification
│   │   └── validationMiddleware.js # Middleware de validation
│   ├── models/
│   │   └── User.js              # Modèle User avec requêtes MySQL
│   ├── routes/
│   │   ├── authRoutes.js        # Routes d'authentification
│   │   ├── healthRoutes.js      # Routes de santé
│   │   └── index.js             # Routes principales
│   ├── database/
│   │   └── init.sql             # Script SQL d'initialisation
│   ├── scripts/
│   │   └── init-db.js           # Script d'initialisation DB
│   ├── server.js            # Serveur principal
│   ├── package.json         # Dépendances API
│   └── README.md            # Documentation API
├── accounting_front/        # Application React
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── context/         # Contexte d'authentification
│   │   └── App.js           # Composant principal
│   └── package.json         # Dépendances React
└── README.md               # Ce fichier
```

## Fonctionnalités

### API Node.js (Structure Modulaire + MySQL)
- ✅ Architecture MVC (Model-View-Controller)
- ✅ Base de données MySQL avec requêtes préparées
- ✅ Contrôleurs séparés par fonctionnalité
- ✅ Middleware d'authentification et validation
- ✅ Routes organisées et modulaires
- ✅ Configuration centralisée
- ✅ Modèle User avec CRUD complet
- ✅ Authentification JWT
- ✅ Inscription et connexion
- ✅ Protection des routes
- ✅ Hachage des mots de passe
- ✅ CORS configuré
- ✅ Protection contre injection SQL

### Application React
- ✅ Interface moderne et responsive
- ✅ Navigation dynamique
- ✅ Formulaires de connexion et inscription
- ✅ Dashboard protégé
- ✅ Gestion d'état avec Context API

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

## Installation et Démarrage

### 1. API Node.js

```bash
cd accounting_api
npm install
```

**Configuration de la base de données :**
```bash
# Créer la base de données et les tables
npm run init-db
```

**Configuration des variables d'environnement :**
Créez un fichier `.env` dans `accounting_api/` :
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=accounting
DB_PORT=3306

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Démarrage :**
```bash
npm run dev
```

L'API sera disponible sur `http://localhost:5000`

### 2. Application React

```bash
cd accounting_front
npm install
npm start
```

L'application sera disponible sur `http://localhost:3000`

## Base de Données

### Tables Principales

#### `users`
- `id` - Clé primaire auto-incrémentée
- `username` - Nom d'utilisateur unique (VARCHAR 100)
- `email` - Email unique (VARCHAR 150)
- `password_hash` - Mot de passe haché (VARCHAR 255)
- `created_at` - Date de création (TIMESTAMP)

#### `transactions` (pour usage futur)
- `id` - Clé primaire auto-incrémentée
- `user_id` - Clé étrangère vers users
- `type` - Type de transaction (income/expense)
- `amount` - Montant (DECIMAL 10,2)
- `description` - Description (VARCHAR 255)
- `category` - Catégorie (VARCHAR 100)
- `date` - Date de transaction (DATE)
- `created_at` - Date de création (TIMESTAMP)

#### `categories` (pour usage futur)
- `id` - Clé primaire auto-incrémentée
- `user_id` - Clé étrangère vers users
- `name` - Nom de la catégorie (VARCHAR 100)
- `type` - Type de catégorie (income/expense)
- `color` - Couleur de la catégorie (VARCHAR 7)
- `created_at` - Date de création (TIMESTAMP)

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)
- `PUT /api/auth/profile` - Mise à jour profil (protégé)
- `GET /api/auth/users` - Tous les utilisateurs (protégé)

### Santé
- `GET /api/health` - Vérification de santé

## Architecture de l'API

### Contrôleurs (`/controllers/`)
- **authController.js** : Gestion de l'authentification (register, login, profile, update, users)
- **healthController.js** : Endpoints de santé de l'API

### Modèles (`/models/`)
- **User.js** : Modèle User avec requêtes MySQL (CRUD complet)

### Middleware (`/middleware/`)
- **authMiddleware.js** : Vérification des tokens JWT
- **validationMiddleware.js** : Validation des données d'entrée

### Routes (`/routes/`)
- **authRoutes.js** : Routes d'authentification
- **healthRoutes.js** : Routes de santé
- **index.js** : Point d'entrée des routes

### Configuration (`/config/`)
- **config.js** : Configuration centralisée (ports, secrets, validation rules)
- **database.js** : Configuration MySQL et pool de connexion

## Utilisation

1. Configurez MySQL et créez la base de données
2. Configurez les variables d'environnement
3. Initialisez la base de données : `npm run init-db`
4. Démarrez l'API : `npm run dev`
5. Démarrez l'application React : `npm start`
6. Créez un compte ou connectez-vous
7. Accédez au dashboard

## Technologies Utilisées

### Backend
- Node.js
- Express.js
- MySQL2 (requêtes préparées)
- bcryptjs (hachage des mots de passe)
- jsonwebtoken (JWT)
- cors (Cross-Origin Resource Sharing)

### Frontend
- React 19
- React Router DOM
- Axios (requêtes HTTP)
- CSS moderne avec gradients et animations

## Développement

Pour le développement, utilisez :
- `npm run dev` pour l'API (avec nodemon)
- `npm start` pour React (avec hot reload)
- `npm run init-db` pour initialiser la base de données

## Sécurité

- Mots de passe hachés avec bcrypt
- JWT pour l'authentification
- Validation des données côté serveur
- Protection des routes sensibles
- Configuration centralisée
- Requêtes SQL préparées (protection contre injection)
- Contraintes de base de données (unique, foreign keys)

## Avantages de la Structure Modulaire + MySQL

- **Maintenabilité** : Code organisé et facile à maintenir
- **Évolutivité** : Facile d'ajouter de nouvelles fonctionnalités
- **Testabilité** : Composants isolés et testables
- **Réutilisabilité** : Middleware et contrôleurs réutilisables
- **Lisibilité** : Structure claire et logique
- **Persistance** : Données stockées en base MySQL
- **Sécurité** : Protection contre injection SQL
- **Performance** : Pool de connexions MySQL

## Dépannage

### Erreurs de connexion MySQL
1. Vérifiez que MySQL est démarré
2. Vérifiez les paramètres de connexion dans `.env`
3. Assurez-vous que l'utilisateur a les droits sur la base de données

### Erreurs de table
1. Exécutez `npm run init-db` pour recréer les tables
2. Vérifiez que le fichier `database/init.sql` est correct

## Prochaines Étapes

- [ ] Gestion des transactions
- [ ] Gestion des catégories
- [ ] Rapports et graphiques
- [ ] Export de données
- [ ] Notifications en temps réel
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Migration de base de données "# accounting" 
