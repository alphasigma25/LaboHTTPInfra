#build
#reverse proxy
docker build -t res/apache_rp ./docker-images/apache-reverse-proxy/
#static part
docker build -t res/apache_php ./docker-images/apache-php-images/
#dynamic part
docker build -t res/express_spells ./docker-images/express-image/

#run
#static part
docker run -d --name apache_static1 res/apache_php
docker run -d --name apache_static2 res/apache_php
#dynamic part
docker run -d --name express_spells1 res/express_spells
docker run -d --name express_spells2 res/express_spells
#reverse proxy
docker run -d --name apache_rp -e STATIC_APP1=172.17.0.2:80 -e STATIC_APP2=172.17.0.3:80 -e DYNAMIC_APP1=172.17.0.4:3000 -e DYNAMIC_APP2=172.17.0.5:3000 -p 8080:80 res/apache_rp

