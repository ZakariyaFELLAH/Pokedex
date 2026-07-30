# Documentation API — Pokédex

## Vue d'ensemble

API REST développée avec **FastAPI** (Python), permettant de gérer une base de données de Pokémon. 
Les données sont stockées dans une base **MariaDB** (Amazon RDS) et les images sont hébergées sur **Amazon S3**.

**URL de base** : `https://bn5oxjg0bpwv3sx5ud98y54n-13-61-52-80.sslip.io`

---

## Sommaire des routes

| Méthode | Endpoint | Description |
|---------|----------|--------------|
| GET | `/` | Redirection vers le frontend |
| GET | `/pokemons` | Liste tous les Pokémon |
| POST | `/pokemons` | Ajoute un nouveau Pokémon |

---

## GET /

### Description
Redirige automatiquement vers la page d'accueil du frontend.

### Paramètres
Aucun

### Réponse
**Code** : `307 Temporary Redirect`
**Location** : `/static/index.html`

---

## GET /pokemons

### Description
Récupère la liste complète des Pokémon enregistrés en base de données.

### Paramètres
Aucun

### Exemple de requête
```bash
curl -X GET https://ton-domaine.sslip.io/pokemons
```

### Réponse
**Code** : `200 OK`
**Content-Type** : `application/json`

```json
[
  {
    "id": 1,
    "name": "Bulbizarre",
    "types": "[\"Plante\", \"Poison\"]",
    "total": 318,
    "hp": 45,
    "attack": 49,
    "defense": 49,
    "attack_special": 65,
    "defense_special": 65,
    "speed": 45,
    "evolution_id": 2,
    "image_url": "https://pokedex-images-zakariya.s3.eu-north-1.amazonaws.com/images/001.png"
  }
]
```

### Codes de réponse possibles
| Code | Signification |
|------|----------------|
| 200 | Succès — liste retournée |
| 500 | Erreur serveur (ex: connexion RDS impossible) |

---

## POST /pokemons

### Description
Ajoute un nouveau Pokémon à la base de données, avec upload automatique de son image vers Amazon S3.

### Type de contenu
`multipart/form-data`

### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|--------------|
| `file` | UploadFile | Oui | Image du Pokémon au format PNG |
| `data` | string (JSON) | Oui | Informations du Pokémon (voir structure ci-dessous) |

### Structure du champ `data` (JSON)

```json
{
  "id": 151,
  "name": "Mew",
  "types": ["Psy"],
  "total": 600,
  "hp": 100,
  "attack": 100,
  "defense": 100,
  "attack_special": 100,
  "defense_special": 100,
  "speed": 100,
  "evolution_id": null
}
```

### Traitement effectué côté serveur
1. Parsing des données JSON reçues (validation via Pydantic)
2. Génération du nom de fichier (`{id}.png`, formaté sur 3 chiffres)
3. Upload de l'image vers le bucket S3 (`pokedex-images-zakariya`)
4. Génération de l'URL S3 publique
5. Insertion des données en base MariaDB (RDS)

### Exemple de requête
```bash
curl -X POST https://ton-domaine.sslip.io/pokemons \
  -F "file=@mew.png" \
  -F 'data={"id":151,"name":"Mew","types":["Psy"],"total":600,"hp":100,"attack":100,"defense":100,"attack_special":100,"defense_special":100,"speed":100}'
```

### Réponse
**Code** : `200 OK`
**Content-Type** : `application/json`

```json
{
  "message": "Pokemon créé",
  "image_url": "https://pokedex-images-zakariya.s3.eu-north-1.amazonaws.com/images/151.png"
}
```

### Codes de réponse possibles
| Code | Signification |
|------|----------------|
| 200 | Succès — Pokémon créé |
| 422 | Erreur de validation des données (champ manquant/invalide) |
| 500 | Erreur serveur (ex: échec upload S3, connexion RDS) |

---

## Sécurité

- Toutes les requêtes transitent en **HTTPS** (certificat SSL via Let's Encrypt)
- L'upload S3 utilise un **utilisateur IAM dédié** (`pokedex-s3-uploader`) avec une policy limitée aux actions `GetObject` et `PutObject`
- La base de données RDS n'est accessible que depuis l'instance EC2 (isolée dans un subnet privé)

---

## Technologies utilisées

- **FastAPI** — Framework web Python
- **mysql-connector-python** — Connexion à la base MariaDB (RDS)
- **boto3** — SDK AWS pour l'upload S3
- **Pydantic** — Validation des données entrantes
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
