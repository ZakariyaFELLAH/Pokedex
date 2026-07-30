# Guide de déploiement AWS — Pokédex

## Vue d'ensemble

Ce guide résume les étapes suivies pour déployer l'application Pokédex (FastAPI + MariaDB) sur une infrastructure AWS complète, incluant sécurisation HTTPS, monitoring et stockage cloud.

**Architecture finale** : EC2 + RDS + S3 + CloudWatch, orchestrés via Coolify avec déploiement continu depuis GitHub.

![Architecture AWS](img/Architecture%20AWS%20-%20Statique%20.drawio.png)

---

## Prérequis

- Compte AWS (Free Tier)
- Repository GitHub du projet
- Clé SSH pour la connexion à l'instance EC2

---

## 1. Configuration IAM

1. Création d'un utilisateur IAM dédié (`admin-user`) plutôt que d'utiliser le compte root
2. Attribution de la policy `AdministratorAccess`
3. Activation du MFA sur le compte root
4. Configuration des alertes de facturation (Budget AWS) : seuils à 0€ (zero spend) et 5€

---

## 2. Lancement de l'instance EC2

1. Création d'une instance **Ubuntu 22.04 LTS**, type **t3.small** (2GB RAM minimum recommandé pour faire tourner Coolify)
2. Génération d'une **key pair** pour l'authentification SSH
3. Configuration du **Security Group** avec les ports suivants :

| Port | Protocole | Usage |
|------|-----------|-------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 8000 | TCP | Interface Coolify |
| 8081 | TCP | API FastAPI |

4. Allocation et association d'une **Elastic IP** pour disposer d'une adresse IP fixe
5. Installation de **Coolify** via son script officiel :

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## 3. Configuration de la base de données RDS

1. Création d'une instance **RDS MariaDB** (db.t3.micro, Free Tier)
2. Connexion automatique au VPC de l'instance EC2 via l'option "Connect to an EC2 compute resource"
3. Isolation dans un **subnet privé**, accessible uniquement depuis l'EC2 (port 3306)
4. Récupération de l'endpoint RDS
5. Import du schéma SQL et des données depuis l'EC2 :

```bash
mysql -h <endpoint_rds> -u admin -p pokedex < database/init/01_schema.sql
mysql -h <endpoint_rds> -u admin -p pokedex < database/init/02_pokemons.sql
```

---

## 4. Déploiement de l'application via Coolify

1. Connexion du repository GitHub à Coolify
2. Configuration des variables d'environnement pour la connexion RDS :

```env
DB_HOST=<endpoint_rds>
DB_PORT=3306
DB_NAME=pokedex
DB_USER=admin
DB_PASSWORD=<mot_de_passe>
```

3. Déploiement de l'application (build automatique depuis le Dockerfile)
4. Vérification de l'accessibilité via `/docs` et `/pokemons`

---

## 5. Configuration HTTPS

1. Génération d'un domaine gratuit via **sslip.io**, directement intégré à Coolify
2. Activation automatique du certificat SSL via **Let's Encrypt**
3. Mise à jour des fichiers `config.js` et `script.js` pour utiliser l'URL HTTPS

⚠️ **Point de vigilance** : le fichier `config.js` contenant l'URL de l'API n'est pas versionné sur GitHub (`.gitignore`), il doit être recréé manuellement dans le container après chaque redéploiement complet :

```bash
cat > /app/static/config.js << 'EOF'
window.API_URL = "https://votre-domaine.sslip.io";
EOF
```

---

## 6. Mise en place du monitoring CloudWatch

Configuration de 6 alarmes réparties entre EC2 et RDS, avec notifications via des **topics SNS** dédiés.

**EC2**

| Métrique | Seuil | Action |
|----------|-------|--------|
| CPUUtilization | 80% | Notification SNS + arrêt instance |
| NetworkIn | 20 Mo | Notification SNS + arrêt instance |
| StatusCheckFailed | 1 | Notification SNS + redémarrage instance |

**RDS**

| Métrique | Seuil | Action |
|----------|-------|--------|
| CPUUtilization | 75% | Notification SNS |
| FreeStorageSpace | 5 Go | Notification SNS |
| DatabaseConnections | 10 | Notification SNS |

> Aucune action automatique (arrêt/redémarrage) n'a été configurée sur RDS afin d'éviter tout risque de perte ou corruption de données.

---

## 7. Configuration du stockage S3

1. Création d'un bucket S3 (`pokedex-images-bucket`) avec politique de lecture publique
2. Création d'un utilisateur IAM dédié (`s3-uploader-user`) avec une policy limitée aux actions `GetObject` et `PutObject`, respectant le principe du moindre privilège
3. Intégration du SDK `boto3` dans le backend FastAPI
4. Configuration des variables d'environnement AWS dans Coolify :

```env
AWS_ACCESS_KEY_ID=<access_key>
AWS_SECRET_ACCESS_KEY=<secret_key>
AWS_REGION=eu-north-1
S3_BUCKET_NAME=pokedex-images-bucket
```

---

## Points de vigilance identifiés

- **Espace disque EBS** : surveiller l'usage, une saturation bloque les redéploiements Coolify (résolu par extension du volume de 8Go à 20Go via `growpart` et `resize2fs`)
- **Compatibilité mobile** : les navigateurs iOS appliquent une politique de sécurité *Mixed Content* stricte, bloquant les requêtes HTTP émises depuis une page HTTPS
- **Reverse proxy après reboot** : après un redémarrage de l'instance, il peut être nécessaire de redémarrer manuellement Traefik (`coolify-proxy`) pour rétablir le routage réseau
- **Coûts AWS** : penser à arrêter EC2 et RDS quotidiennement en dehors des phases de travail actif pour limiter la facturation

---

## Ressources et coûts estimés

| Service | Type | Coût |
|---------|------|------|
| EC2 | t3.small | ~0.02$/h (hors Free Tier) |
| RDS | db.t3.micro | Free Tier (750h/mois) |
| S3 | Stockage | Free Tier (5GB) |
| CloudWatch | Alarmes | Free Tier (10 alarmes) |

---

## Nettoyage / Fin de projet

Pour éviter toute facturation après utilisation :

```bash
# Depuis la console AWS
1. Terminer l'instance EC2
2. Supprimer l'instance RDS (avec suppression du snapshot final si non nécessaire)
3. Vider et supprimer le bucket S3 si besoin
4. Libérer l'Elastic IP
```