docker exec mysql mysqldump -uroot -proot_pwd --single-transaction --master-data=2 node_app_web > node_app_web.sql;

docker exec -it mysql-slave mysql -uroot -proot_pwd -e "
STOP REPLICA;
RESET REPLICA ALL;
DROP DATABASE IF EXISTS node_app_web;
CREATE DATABASE node_app_web;
";

docker exec -it mysql-slave mysql -uroot -proot_pwd -e "
CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED WITH caching_sha2_password BY 'repl_pwd';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
";

docker exec -i mysql-slave mysql -uroot -proot_pwd node_app_web < node_app_web.sql;

docker exec -it mysql-slave mysql -uroot -proot_pwd -e "
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='mysql',
  SOURCE_PORT=3306,
  SOURCE_USER='repl',
  SOURCE_PASSWORD='repl_pwd',
  SOURCE_LOG_FILE='mysql-bin.000057',
  SOURCE_LOG_POS=19099,
  GET_SOURCE_PUBLIC_KEY = 1;
START REPLICA;
"
