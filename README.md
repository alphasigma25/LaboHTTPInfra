# Laboratoire Infrastructure HTTP
> Autheur : Anne Sophie Ganguillet

## Partie 1 - Serveur statique HTTP
### Configuration

Pour cette première partie, le site se compose de la manière suivante :
- un dossier apache-php-image contenant :
    - dossier content contenant un example de site bootstrap téléchargé depuis https://startbootstrap.com/theme/one-page-wonder
    - un fichier Dockerfile pour la création du docker
    ``` Dockerfile
    # Dockerfile
  
    # Chargement de l'image apache
    FROM php:7.2-apache
  
    # Copie du site statique dans l'image
    COPY content/ /var/www/html/ 
    ```
Pour mettre en place le serveur avec docker on exécute les commandes suivantes depuis le dossier apache-php-image :
```
docker build -t res/apache_php .
docker run -d -p 8080:80 --name apache_static res/apache_php
```

### Visualisation

Après avoir lancé le container docker créé, on peut se rendre à l'adresse `http://localhost:8080` pour voir le contenu du site statique.

## Partie 2 - Serveur dynamique HTTP

Dans cette deuxième partie, on implémente une API qui renvoie des listes de sorts. Les sorts se présentent de la manière suivante :
```json
{
  "mana" : "valeur entre 1 et 100",
  "formula" : "mot aléatoire",
  "effect" : "phrase aléatoire"
}
```
        
### Configuration

Pour cette deuxième partie, le site se compose de la manière suivante :
- un dossier apache-php-image sans changement par rapport à l'étape précédente.
- un dossier express-image contenant :
    - dossier src contenant un projet node.js fournissant une API qui renvoie des listes de sorts au format json.
    - un fichier Dockerfile pour la création du docker
    ``` Dockerfile
    # Dockerfile
  
    # Chargement de l'image node
    FROM node:15.11.0
  
    # Copie du dossier src dans l'image node
    COPY src /opt/app
  
    # Exécution du script pour lancer l'API
    CMD ["node", "/opt/app/index.js"] 
    ```
Pour mettre en place le serveur avec docker on exécute les commandes suivantes depuis le dossier express-image :
```
docker build -t res/express_spells .
docker run -d -p 3000:80 --name express_dynamic res/express_spells
```

### Visualisation

Après avoir lancé le container docker créé, on peut se rendre à l'adresse `http://localhost:8080/api/spell` pour voir le résultat.

## Partie 3 - Reverse proxy

### Configuration

## Partie 4 - Requetes ajax avec JQuery

### Configuration

## Partie 5 - Configuration dynamique reverse proxy

### Configuration

## Bonus 1 - Load balancing

### Configuration

apache reference : https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html
