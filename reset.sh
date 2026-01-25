#!/bin/sh -ex

pnpm app:reset;

pnpm start:cli seed:tier;
pnpm start:cli seed:api-key;
pnpm start:cli seed:app-version;
pnpm start:cli seed:user-role;
