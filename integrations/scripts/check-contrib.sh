#!/bin/bash
set -e
export NX_SKIP_NX_CACHE=true

./node_modules/.bin/nx reset

log=$GIT_LOG || $(git show --summary)

if [[ ${log} != *"skip contrib"* ]];
then
rm -rf ./dist
rm -rf ./integrations/nestjs-mod-contrib
git clone https://github.com/nestjs-mod/nestjs-mod-contrib.git ./integrations/nestjs-mod-contrib

./node_modules/.bin/nx run-many --target=build --all --parallel=false

rm -rf ./integrations/nestjs-mod-contrib/tmp/lib/schematics
mkdir -p ./integrations/nestjs-mod-contrib/tmp/lib/schematics
cp -Rf ./dist/libs/schematics/* ./integrations/nestjs-mod-contrib/tmp/lib/schematics

rm -rf ./integrations/nestjs-mod-contrib/tmp/lib/common
mkdir -p ./integrations/nestjs-mod-contrib/tmp/lib/common
cp -Rf ./dist/libs/common/* ./integrations/nestjs-mod-contrib/tmp/lib/common

rm -rf ./integrations/nestjs-mod-contrib/tmp/lib/reports
mkdir -p ./integrations/nestjs-mod-contrib/tmp/lib/reports
cp -Rf ./dist/libs/reports/* ./integrations/nestjs-mod-contrib/tmp/lib/reports

rm -rf ./integrations/nestjs-mod-contrib/tmp/lib/testing
mkdir -p ./integrations/nestjs-mod-contrib/tmp/lib/testing
cp -Rf ./dist/libs/testing/* ./integrations/nestjs-mod-contrib/tmp/lib/testing

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/tmp/lib/common/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/tmp/lib/common && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/tmp/lib/reports/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/tmp/lib/reports && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/tmp/lib/testing/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/tmp/lib/testing && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/nestjs-mod-contrib/tmp/lib/schematics/package.json version 0.0.0
cd ./integrations/nestjs-mod-contrib/tmp/lib/schematics && npm pack . && cd ../../../../../

cd ./integrations/nestjs-mod-contrib
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/tmp/lib/common/nestjs-mod-common-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/tmp/lib/reports/nestjs-mod-reports-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/tmp/lib/testing/nestjs-mod-testing-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/nestjs-mod-contrib/tmp/lib/schematics/nestjs-mod-schematics-0.0.0.tgz

./node_modules/.bin/nx run-many --exclude=@nestjs-mod/source -t=generate --parallel=false && npm run make-ts-list && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod/source -t=build --parallel=false && npm run docs:infrastructure && npm run test
fi