# Laboratoire Infrastructure HTTP
> Autheur : Anne Sophie Ganguillet

Chaque étape de ce laboratoire a été réalisé sur une branche séparée du git.

- Partie 1 : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-apache-static
- Partie 2 : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-express-dynamic
- Partie 3 : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-apache-reverse-proxy
- Partie 4 : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-ajax-jquery
- Partie 5 : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-dynamic-configuration
- Bonus 1  : https://github.com/soso24soso/LaboHTTPInfra/tree/fb-load-balancing-1

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
### Docker

Pour mettre en place le serveur avec docker on exécute les commandes suivantes depuis le dossier apache-php-image :
```bash
docker build -t res/apache_php .
docker run -d -p 8080:80 --name apache_static res/apache_php
```

### Visualisation

Après avoir lancé le container docker créé, on peut se rendre à l'adresse `http://localhost:8080` pour voir le contenu du site statique.
