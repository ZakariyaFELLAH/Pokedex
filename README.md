# Pokédex

Projet réalisé en stage DevOps pour pratiquer **Git**, **Docker**, **Docker Compose**, la mise en place d'une **CI/CD complète** et le **déploiement sur AWS**.

L'application est un Pokédex full-stack : une API REST FastAPI connectée à une base **MariaDB**, avec un front-end vanilla JS, containerisée et déployée sur une infrastructure cloud **AWS** (EC2, RDS, S3, CloudWatch).

**Démo en ligne** : [https://bn5oxjg0bpwv3sx5ud98y54n-13-61-52-80.sslip.io](https://bn5oxjg0bpwv3sx5ud98y54n-13-61-52-80.sslip.io)

---

## Stack

- **Back-end** : Python 3.13 + FastAPI + Uvicorn
- **Base de données** : MariaDB 11 (Amazon RDS en production)
- **Front-end** : HTML / CSS / JavaScript vanilla
- **Stockage** : Amazon S3 (images)
- **Containerisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions (tests + docker build) + Coolify (déploiement continu)
- **Infrastructure** : AWS (EC2, RDS, S3, VPC, IAM, CloudWatch)
- **Monitoring** : Amazon CloudWatch (6 alarmes EC2/RDS + notifications SNS)

---

## Documentation

- [Documentation API](docs/API_DOCUMENTATION.md)
- [Guide de déploiement AWS](docs/DEPLOYMENT_GUIDE.md)

---

## Prérequis

- Docker
- Docker Compose
- Make

---

## Installation (développement local)

```bash
git clone https://github.com/ZakariyaFELLAH/Pokedex.git
cd Pokedex
cp .env.example .env
```

Remplis les mots de passe dans le fichier `.env` puis lance :

```bash
make start
```

### Configuration du frontend

```bash
cp static/config.example.js static/config.js
```

Remplace `VOTRE_IP` par votre adresse IP dans `config.js`.

L'application est disponible sur **http://localhost:8081**

---

## Commandes

| Commande | Description |
|---|---|
| `make start` | Démarre les containers en arrière-plan |
| `make stop` | Arrête les containers |
| `make build` | Reconstruit les images |
| `make restart` | Arrête puis redémarre |
| `make reset` | Repart de zéro (supprime les volumes) |
| `make logs` | Affiche les logs en temps réel |
| `make ps` | Liste les containers actifs |

---

## Structure
.
├── main.py # API FastAPI
├── database/
│ ├── db.py # Connexion MariaDB
│ └── init/
│ ├── 01_schema.sql # Création de la table
│ └── 02_pokemons.sql # Données initiales
├── static/
│ ├── index.html
│ ├── style.css
│ ├── script.js
│ ├── config.example.js
│ ├── images/ # PNG des Pokémon
│ └── sound/ # Effets sonores
├── docs/
│ ├── API_DOCUMENTATION.md # Documentation des endpoints
│ ├── DEPLOYMENT_GUIDE.md # Guide de déploiement AWS
│ └── img/
│   └── Architecture AWS - Statique .drawio.png # Schéma d'architecutre cible
├── tests/ # Tests pytest
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── requirements.txt
└── .env.example
---

## CI/CD

### Intégration continue (GitHub Actions)

Un pipeline se déclenche à chaque push sur `main` ou lors d'une Pull Request vers `main` :

1. Démarre un service MariaDB
2. Installe les dépendances Python
3. Initialise le schéma de base de données
4. Lance les tests avec `pytest`
5. Si les tests passent → vérifie que l'image Docker se build correctement

### Déploiement continu (Coolify)

Une fois la CI validée et le code mergé sur `main`, **Coolify** détecte automatiquement le push via un webhook GitHub et déploie la nouvelle version sur l'instance EC2 de production.

---

## Infrastructure AWS

L'application est déployée sur une infrastructure AWS comprenant :

- **EC2** (t3.small) : hébergement de l'application via Coolify
- **RDS** (MariaDB) : base de données managée, isolée dans un subnet privé
- **S3** : stockage des images des Pokémon
- **VPC** : réseau isolé avec subnets publics/privés et Security Groups
- **IAM** : gestion des accès selon le principe du moindre privilège
- **CloudWatch** : monitoring et alertes automatiques

Le détail complet de l'infrastructure est disponible dans le [guide de déploiement](docs/DEPLOYMENT_GUIDE.md).

---

## Sécurité

- Communications chiffrées en **HTTPS** (certificat SSL via Let's Encrypt)
- Base de données RDS accessible uniquement depuis l'instance EC2
- Utilisateurs IAM dédiés avec permissions limitées (principe du moindre privilège)
- Variables sensibles gérées via variables d'environnement (jamais commitées)