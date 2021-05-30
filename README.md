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
### Docker

Pour mettre en place le serveur avec docker on exécute les commandes suivantes depuis le dossier express-image :
```bash
docker build -t res/express_spells .
docker run -d -p 9090:3000 --name express_dynamic res/express_spells
```

### Visualisation

Après avoir lancé le container docker créé, on peut se rendre à l'adresse http://localhost:9090/spells pour voir
le résultat.

## Partie 3 - Reverse proxy

### Configuration

Pour cette troisième partie, le site se compose de la manière suivante :
- les dossiers apache-php-image et express-image sans changement par rapport à l'étape précédente.
- un dossier express-reverse proxy contenant sans changement :
    - dossier src contenant un projet node.js fournissant une API qui renvoie des listes de sorts au format json.
    - un fichier Dockerfile pour la création du docker
      ``` Dockerfile
      # Dockerfile
      
      # Chargement de l'image apache
      FROM php:7.2-apache
      
      # Copie des fichiers de configuration dans l'image apache
      # /etc/apache2 : dossier contenant la configuration du serveur apache. Contient en particulier des s-dossiers 
      # mod-xxx pour les modules et site-xxx pour les sites (xxx = available ou enabled)
      COPY conf/ /etc/apache2
      
      # Commandes pour activer des modules apache
      # a2enmod pour activer les modules proxy et proxy_http
      RUN a2enmod proxy proxy_http
      # a2ensite pour activer les sites
      RUN a2ensite 000-* 001-*
      ```
      Il peut également être utile de rajouter la commande suivante pour installer vim et faire des modifications
      manuelles dans les conteneurs Docker lors de phases de tests.
      ```dockerfile 
      RUN apt-get update && \
      apt-get install -y vi
      ```
    - un dossier conf/sites-available avec les fichiers de configuration suivants :
        - `000-default.conf` :
          ```
          <VirtualHost *:80>
          </VirtualHost>
          ```
        - `001-reverse-proxy.conf` :
          ```injectablephp
          <VirtualHost *:80>
              ServerName demo.res.ch
                
              ProxyPass "/api/spells/" "http://172.17.0.3:3000/"
              ProxyPassReverse "/api/spells/" "http://172.17.0.3:3000/"
          
              ProxyPass "/" "http://172.17.0.2:80/"
              ProxyPassReverse "/" "http://172.17.0.2:80/"
          
          </VirtualHost>
          ```

### Docker

Pour mettre en place le serveur avec docker on exécute les commandes suivantes depuis le dossier docker-images :

Build des images docker
```bash
docker build -t res/apache_rp ./apache-reverse-proxy/
docker build -t res/apache_php ./apache-php-images/
docker build -t res/express_spells ./express-image/
```

Création des conteneur
```bash
docker run -d --name apache_static res/apache_php
docker run -d --name express_spells res/express_spells
docker run -d --name apache_rp -p 8080:80 res/apache_rp
```

Pour que tout fonctionne correctement, il faut s'assurer que les adresses ip données aux conteneurs pour les sites statiques et dynamiques correspondent aux adresses écrites en dur dans le fichier `001-reverse-proxy.conf`. Pour ce faire, on peut faire un `docker inspect apache_static` et `docker inspect express_spells`.
Si les adresses ne sont pas les mêmes, il faut changer manuellement les adresses dans le fichier de configuration pour qu'elles correspondent.
Il faut aussi s'assurer que les éventuels précédents conteneurs homonymes ait été effacés.

### Visualisation

Après avoir lancé le conteneur docker créé, si les adresses ip des docker pour le serveur statique et dynamique correspondent, on peut se rendre à l'adresse `http://localhost:8080` pour voir le résultat.