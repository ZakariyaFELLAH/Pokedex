# Pokédex

Projet réalisé en stage DevOps pour pratiquer **Git**, **Docker**, **Docker Compose** et la mise en place d'une **CI GitHub Actions**.

L'application est un Pokédex full-stack : une API REST FastAPI connectée à une base MariaDB, avec un front-end vanilla JS, le tout containerisé et déployable en une commande.

## Stack

- **Back-end** : Python 3.13 + FastAPI + Uvicorn
- **Base de données** : MariaDB 11
- **Front-end** : HTML / CSS / JavaScript vanilla
- **Containerisation** : Docker + Docker Compose
- **CI** : GitHub Actions (tests + docker build) — pas de CD

## Prérequis

- Docker
- Docker Compose
- Make

## Installation

```bash
git clone https://github.com/ZakariyaFELLAH/Pokedex.git
cd Pokedex
cp .env.example .env
```

Remplis les mots de passe dans le fichier `.env` puis lance :

```bash
make start
```

L'application est disponible sur **http://localhost:8000**

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

## Structure

```
.
├── main.py                     # API FastAPI
├── database/
│   ├── db.py                   # Connexion MariaDB
│   └── init/
│       ├── 01_schema.sql       # Création de la table
│       └── 02_pokemons.sql     # Données initiales
├── static/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── images/                 # PNG des Pokémon
│   └── sound/                  # Effets sonores
├── tests/                      # Tests pytest
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── requirements.txt
└── .env.example
```

## CI (Continuous Integration)

Un pipeline GitHub Actions se déclenche à chaque push sur `main` ou `dev`.

> Ce pipeline fait de la CI uniquement — pas de CD. L'application n'est pas déployée automatiquement, le pipeline vérifie uniquement que le code est valide et que l'image Docker se construit correctement.

1. Démarre un service MariaDB
2. Installe les dépendances Python
3. Initialise le schéma de base de données
4. Lance les tests avec `pytest`
5. Si les tests passent → vérifie que l'image Docker se build correctement
