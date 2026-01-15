#!/bin/sh -ex

docker exec mysql \
  mysqldump -u root -proot_pwd node_app_web \
  > node_app_web_dump.sql

docker exec -i mysql-slave \
  mysql -u root -proot_pwd node_app_web \
  < node_app_web_dump.sql


