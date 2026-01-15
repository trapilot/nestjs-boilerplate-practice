#!/bin/sh -ex

pnpm app:reset;

pnpm start:cli api-key:seed;
pnpm start:cli app-version:seed;
