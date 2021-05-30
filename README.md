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

### DNS

Pour pouvoir voir le site depuis un navigateur, il faut faire une configuration DNS et affecter demo.res.ch à l'adresse ip de localhost.
Pour ce faire, il faut rajouter la ligne suivante dans le fichier hosts :
```
127.0.0.1     demo.res.ch
```

### Visualisation

Après avoir lancé le conteneur docker créé, si les adresses ip des docker pour le serveur statique et dynamique correspondent, on peut se rendre à l'adresse http://demo.res.ch:8080/ pour voir le résultat.

## Partie 4 - Requetes ajax avec JQuery

### Configuration

Dans cette étape, on modifie le dossier docker-images/apache-php-image de la manière suivante :
- dans `/content/index.html` on rajoute des balises script:
```html
<body>

    (...)
    
    <!-- charger JQuery pour pouvoir l'utiliser -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  
    <!-- Rajout d'un script pour charger des sorts -->
    <script src="js/spells.js"></script>
</body>
```
- dans `/content/js/` on rajoute un fichier `spells.js` qui va récupérer des informations depuis l'api et qui l'affiche sur notre page statique
```javascript
$(function () {
    console.log("loading students");

    function loadSpells() {
        $.getJSON( "/api/spells/", function( spells ){
            console.log(spells);
            var message = "No spell in the book";
            if (spells.length > 0){
                message = spells[0].formula + " " + spells[0].mana;
            }
            $(".masthead-heading").text(message);
        }) ;
    }

    loadSpells();
    setInterval( loadSpells, 2000);
});
```
### Docker

Pour lancer l'infrastructure, on utilise les même commandes qu'à l'étape précédente et on effectue les mêmes vérifications.

### Visualisation

Après avoir lancé le conteneur docker créé, si les adresses ip des dockers pour le serveur statique et dynamique correspondent, on peut se rendre à l'adresse http://demo.res.ch:8080/ pour voir le résultat.
Si tout s'est bien passé, le site affiche toutes les deux secondes un nouveau sort.

## Partie 5 - Configuration dynamique reverse proxy

### Configuration

Dans cette étape, on modifie Dockerfile et on rajoute des fichiers suivants dans le sous-dossier `docker-images/apache-reverse-proxy` :
- Dockerfile :
  ```dockerfile
  FROM php:7.2-apache
  
  # 2 lignes ajoutées :
  COPY apache2-foreground /usr/local/bin/
  COPY templates /var/apache2/templates
  
  COPY conf/ /etc/apache2
  
  RUN a2enmod proxy proxy_http
  RUN a2ensite 000-* 001-*
  ```
- `apache2-foreground` : il faut aller chercher la bonne version de ce fichier dans le repository github correspondant
  au projet qui a permis la création de l'image docker que nous utilisons. Dans le cas présent, la référence
  suivante a été utilisée : https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html
  Le fichier a ensuite été complété en rajoutant les commandes suivantes après la commande `set -e` :
  ```
  echo "Setup for the RES lab..."
  echo "Static app URL: $STATIC_APP"
  echo "Dynamic app URL: $DYNAMIC_APP"
  php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf
  ```
  Ceci permet de récupérer, lors de la création du docker, les adresses ip fournies en paramètre `$STATIC_APP` et `$DYNAMIC_APP` de sorte que les adresses ip ne soient plus écrites en dur.
- `/templates/config-template.php` : on crée le fichier suivant qui va écrire dans le fichier de configuration du site les bonnes adresses pour le reverse-proxy, récupéré dans les variables `$STATIC_APP` et `$DYNAMIC_APP`.
  ```injectablephp
  <?php
      $static_app = getenv('STATIC_APP');
      $dynamic_app = getenv('DYNAMIC_APP');
  ?>
  <VirtualHost *:80>
      ServerName demo.res.ch
  
      ProxyPass '/api/spells/' 'http://<?php print "$dynamic_app"?>/'
      ProxyPassReverse '/api/spells/' 'http://<?php print "$dynamic_app"?>/'
  
      ProxyPass '/' 'http://<?php print "$static_app"?>/'
      ProxyPassReverse '/' 'http://<?php print "$static_app"?>/'
  
  </VirtualHost>
  ```

### Docker

Pour construire les images Dockers, on utilise les mêmes commandes que lors des étapes précédentes, et on rajoute
les flag -e pour donner les adresses IP des docker des sites statique et dynamique
```bash
docker run -d --name apache_static res/apache_php
docker run -d --name express_spells res/express_spells
docker run -d --name apache_rp -e STATIC_APP1=172.17.0.2:80 -e -e DYNAMIC_APP1=172.17.0.3:3000 -p 8080:80 res/apache_rp
```

### Visualisation

Après avoir lancé le conteneur docker créé, si les adresses ip des dockers pour le serveur statique et dynamique correspondent, on peut se rendre à l'adresse http://demo.res.ch:8080/ pour voir le résultat.