#!/bin/bash
set -e
export NX_SKIP_NX_CACHE=true

npm run nx -- reset

log=$(git show --summary)

if [[ ${log} != *"skip contrib"* ]];
then
rm -rf ./dist
rm -rf ./integrations/nestjs-mod-contrib
git clone https://github.com/nestjs-mod/nestjs-mod-contrib.git ./integrations/nestjs-mod-contrib

npm run nx -- run-many --target=build --all

rm -rf ./integrations/nestjs-mod-contrib/lib/schematics
mkdir -p ./integrations/nestjs-mod-contrib/lib/schematics
cp -Rf ./dist/libs/schematics/* ./integrations/nestjs-mod-contrib/lib/schematics

rm -rf ./integrations/nestjs-mod-contrib/lib/common
mkdir -p ./integrations/nestjs-mod-contrib/lib/common
cp -Rf ./dist/libs/common/* ./integrations/nestjs-mod-contrib/lib/common

rm -rf ./integrations/nestjs-mod-contrib/lib/reports
mkdir -p ./integrations/nestjs-mod-contrib/lib/reports
cp -Rf ./dist/libs/reports/* ./integrations/nestjs-mod-contrib/lib/reports

rm -rf ./integrations/nestjs-mod-contrib/lib/testing
mkdir -p ./integrations/nestjs-mod-contrib/lib/testing
cp -Rf ./dist/libs/testing/* ./integrations/nestjs-mod-contrib/lib/testing

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/lib/common/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/lib/common && npm pack . && cd ../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/lib/reports/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/lib/reports && npm pack . && cd ../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/lib/testing/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/lib/testing && npm pack . && cd ../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/lib/schematics/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/lib/schematics && npm pack . && cd ../../../../

cd ./integrations/nestjs-mod-contrib
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/lib/common/nestjs-mod-common-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/lib/reports/nestjs-mod-reports-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/lib/testing/nestjs-mod-testing-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/lib/schematics/nestjs-mod-schematics-0.0.0.tgz

npm run nx:many -- -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run tsc:lint && npm run nx:many -- -t=build --skip-nx-cache=true && npm run docs:infrastructure && npm run test
fi