#!/bin/bash
set -e
export NX_SKIP_NX_CACHE=true

npm run nx -- reset

rm -rf ./dist
rm -rf ./integrations/tmp
mkdir -p ./integrations/tmp
cd ./integrations/nestjs-mod-example
rm -rf ./apps
rm -rf ./libs
rm -rf ./tsconfig.base.json
# rm -rf !\(".git"\)
cd ../..

npm run nx -- run-many --target=build --all

cd ./integrations/tmp
npx --yes create-nx-workspace@17.2.8 --name=project-name --preset=empty --interactive=false --nx-cloud=false
rm -rf .git
cd ../..
yes | cp -rf ./integrations/tmp/project-name/* ./integrations/nestjs-mod-example/

cd ./integrations/nestjs-mod-example
npm install --save-dev @nestjs-mod/schematics@latest
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/app-name --name=app-name --projectNameAndRootFormat=as-provided --strict=true
./node_modules/.bin/nx g @nestjs-mod/schematics:library feature-name --buildable --publishable --directory=libs/feature-name --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
npm run manual:prepare

. ./source .env
kill -9 $(lsof -t -i:$APP_NAME_PORT) | echo "Killed"
node ./dist/apps/app-name/main.js &
(
    sleep 5 && npm run nx -- e2e app-name-e2e
)
sleep 5
kill -9 $(lsof -t -i:$APP_NAME_PORT) | echo "Killed"
