#!/bin/sh -ex

# allocate swap space
# fallocate -l 512M /swapfile
# chmod 0600 /swapfile
# mkswap /swapfile
# echo 10 > /proc/sys/vm/swappiness
# swapon /swapfile
# echo 1 > /proc/sys/vm/overcommit_memory

if [ "$DATABASE_MIGRATE" = "true" ]; then
  yarn db:deploy;
fi
yarn start:prod;