#!/bin/sh


OUTPUT_ZIP="nestjs-boilerplate.zip"
DIR_TO_ZIP="."

# yarn start:clean;
# yarn schematics:clean;
rm -f "$OUTPUT_ZIP"

zip -r $OUTPUT_ZIP $DIR_TO_ZIP -x \
  ".DS_Store" \
  "*/.DS_Store" \
  ".git/*" \
  "dist/*" \
  "node_modules/*" \
  "logs/*" \
  ".env" \
  "zip.sh" \
  "yarn.lock" \
  "public/docs/*"  "public/pdfs/*"  "public/invoices/*" "public/uploads/*" "public/static/fonts/*" \
  "private/data/*" "private/certs/*" \
  "packages/nest-schematics/dist/*" "packages/nest-schematics/node_modules/*" "packages/nest-schematics/yarn.lock"