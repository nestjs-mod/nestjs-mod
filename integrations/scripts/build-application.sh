#!/bin/bash
set -e
export NX_SKIP_NX_CACHE=true

./node_modules/.bin/nx reset

log=$(git show --summary)

if [[ ${log} != *"skip integrations"* ]];
then
rm -rf ./dist
rm -rf ./integrations/app

./node_modules/.bin/nx run-many --target=build --all
rm -rf ./integrations/app

cd ./integrations
npx --yes create-nx-workspace@19.5.3 --name=app --preset=apps --interactive=false --ci=skip
cd ../

yes | cp -R ./integrations/default/package.json ./integrations/app/package.json

rm -rf ./integrations/app/tmp/lib/schematics
mkdir -p ./integrations/app/tmp/lib/schematics
cp -Rf ./dist/libs/schematics/* ./integrations/app/tmp/lib/schematics

rm -rf ./integrations/app/tmp/lib/common
mkdir -p ./integrations/app/tmp/lib/common
cp -Rf ./dist/libs/common/* ./integrations/app/tmp/lib/common

rm -rf ./integrations/app/tmp/lib/reports
mkdir -p ./integrations/app/tmp/lib/reports
cp -Rf ./dist/libs/reports/* ./integrations/app/tmp/lib/reports

rm -rf ./integrations/app/tmp/lib/testing
mkdir -p ./integrations/app/tmp/lib/testing
cp -Rf ./dist/libs/testing/* ./integrations/app/tmp/lib/testing

cd ./integrations/app
git init
npm install --save-dev @nx/nest@19.5.3
./node_modules/.bin/nx g @nx/nest:application --directory=apps/server --name=server --projectNameAndRootFormat=as-provided --strict=true
cd ../../

npx --yes replace-json-property ./integrations/app/tmp/lib/common/package.json version 0.0.0
cd ./integrations/app/tmp/lib/common && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/app/tmp/lib/reports/package.json version 0.0.0
cd ./integrations/app/tmp/lib/reports && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/app/tmp/lib/testing/package.json version 0.0.0
cd ./integrations/app/tmp/lib/testing && npm pack . && cd ../../../../../

npx --yes replace-json-property ./integrations/app/tmp/lib/schematics/package.json version 0.0.0
cd ./integrations/app/tmp/lib/schematics && npm pack . && cd ../../../../../

cd ./integrations/app
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/common/nestjs-mod-common-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/reports/nestjs-mod-reports-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/testing/nestjs-mod-testing-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/schematics/nestjs-mod-schematics-0.0.0.tgz
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/server-mod --name=server-mod --projectNameAndRootFormat=as-provided --strict=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library feature --buildable --publishable --directory=libs/feature --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/common/nestjs-mod-common-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/reports/nestjs-mod-reports-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/testing/nestjs-mod-testing-0.0.0.tgz
npm install --save-dev --no-cache ../../integrations/app/tmp/lib/schematics/nestjs-mod-schematics-0.0.0.tgz
./node_modules/.bin/nx run-many --exclude=@nestjs-mod/source -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod/source -t=build --skip-nx-cache=true && npm run docs:infrastructure && npm run test

./node_modules/.bin/nx build server
kill -9 $(lsof -t -i:3000) | echo "Killed"
node ./dist/apps/server/main.js &
(
    sleep 5 && ./node_modules/.bin/nx e2e server-e2e
)
sleep 5
kill -9 $(lsof -t -i:3000) | echo "Killed"

sleep 5

. ./.env
./node_modules/.bin/nx build server-mod
kill -9 $(lsof -t -i:$SERVER_MOD_PORT) | echo "Killed"
node ./dist/apps/server-mod/main.js &
(
    sleep 5 && ./node_modules/.bin/nx e2e server-mod-e2e
)
sleep 5
kill -9 $(lsof -t -i:$SERVER_MOD_PORT) | echo "Killed"
fi