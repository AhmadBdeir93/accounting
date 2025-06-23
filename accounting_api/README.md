# Accounting API

API Node.js modulaire avec MySQL pour l'application de comptabilité.

## Structure du Projet

```
accounting_api/
├── config/
│   ├── config.js              # Configuration centralisée
│   └── database.js            # Configuration MySQL
├── controllers/
│   ├── authController.js      # Contrôleurs d'authentification
│   └── healthController.js    # Contrôleurs de santé
├── middleware/
│   ├── authMiddleware.js      # Middleware d'authentification
│   └── validationMiddleware.js # Middleware de validation
├── models/
│   └── User.js                # Modèle User avec requêtes MySQL
├── routes/
│   ├── authRoutes.js          # Routes d'authentification
│   ├── healthRoutes.js        # Routes de santé
│   └── index.js               # Routes principales
├── database/
│   └── init.sql               # Script SQL d'initialisation
├── scripts/
│   └── init-db.js             # Script d'initialisation DB
├── server.js                  # Serveur principal
├── package.json               # Dépendances
└── README.md                  # Ce fichier
```

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

## Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer la base de données MySQL**
```bash
# Créer la base de données et les tables
npm run init-db
```

3. **Configurer les variables d'environnement**
Créez un fichier `.env` à la racine du projet :
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

## Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

## Base de Données

### Tables

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

### Initialisation

Pour initialiser la base de données :
```bash
npm run init-db
```

## Endpoints

### Authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/login
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/auth/profile
Récupération du profil utilisateur (protégé).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/auth/profile
Mise à jour du profil utilisateur (protégé).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

#### GET /api/auth/users
Récupération de tous les utilisateurs (protégé, pour admin).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Réponse:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Santé

#### GET /api/health
Vérification de l'état de l'API.

**Réponse:**
```json
{
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "OK"
}
```

## Validation

### Règles de validation

- **Username**: 3-100 caractères
- **Email**: Format email valide, max 150 caractères
- **Password**: 6-100 caractères

### Messages d'erreur

- `All fields are required` - Champs manquants
- `Username must be between 3 and 100 characters long` - Username invalide
- `Please provide a valid email address` - Email invalide
- `Password must be between 6 and 100 characters long` - Mot de passe invalide
- `User already exists` - Utilisateur déjà existant
- `Username already exists` - Nom d'utilisateur déjà existant
- `Email already exists` - Email déjà existant
- `Invalid credentials` - Identifiants incorrects
- `Access token required` - Token manquant
- `Invalid token` - Token invalide

## Sécurité

- Mots de passe hachés avec bcrypt (salt rounds: 10)
- JWT pour l'authentification
- Validation des données côté serveur
- Protection des routes sensibles
- CORS configuré
- Requêtes SQL préparées (protection contre injection)

## Modèle User

Le modèle User inclut les méthodes suivantes :

- `create(username, email, passwordHash)` - Créer un utilisateur
- `findByEmail(email)` - Trouver par email
- `findById(id)` - Trouver par ID
- `findByUsername(username)` - Trouver par username
- `findAll()` - Récupérer tous les utilisateurs
- `update(id, updateData)` - Mettre à jour un utilisateur
- `delete(id)` - Supprimer un utilisateur
- `count()` - Compter les utilisateurs
- `search(searchTerm, limit)` - Rechercher des utilisateurs

## Développement

### Ajouter un nouveau contrôleur

1. Créez un fichier dans `controllers/`
2. Exportez les fonctions du contrôleur
3. Créez les routes correspondantes dans `routes/`
4. Ajoutez les routes au fichier `routes/index.js`

### Ajouter un nouveau modèle

1. Créez un fichier dans `models/`
2. Définissez les méthodes de requête SQL
3. Utilisez le pool de connexion MySQL
4. Gérez les erreurs et les contraintes

### Ajouter un nouveau middleware

1. Créez un fichier dans `middleware/`
2. Exportez les fonctions du middleware
3. Importez et utilisez dans les routes

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
- [ ] Upload de fichiers
- [ ] Logs et monitoring
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Migration de base de données 