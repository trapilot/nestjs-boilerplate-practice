docker exec mysql mysqldump -uroot -proot_pwd --single-transaction node_app_web > node_app_web.sql;

docker exec -it mysql-slave mysql -uroot -proot_pwd -e "STOP REPLICA; CREATE DATABASE IF NOT EXISTS node_app_web;";

docker exec -i mysql-slave mysql -uroot -proot_pwd node_app_web < node_app_web.sql;

docker exec -it mysql-slave mysql -uroot -proot_pwd -e "START REPLICA;";
