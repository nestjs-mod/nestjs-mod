#!/bin/bash
export NX_SKIP_NX_CACHE=true

rm -rf ./dist
rm -rf ./integrations/app

npm run nx -- run-many --target=build --all
rm -rf ./integrations/app

cd ./integrations
npx --yes create-nx-workspace@17.2.8 --name=app --preset=empty --interactive=false --nx-cloud=false
cd ../

yes | cp -R ./integrations/default/package.json ./integrations/app/package.json

rm -rf ./integrations/app/lib/schematics
mkdir -p ./integrations/app/lib/schematics
cp -Rf ./dist/libs/schematics/* ./integrations/app/lib/schematics

cd ./integrations/app
npm i --force
npm install --save-dev @nx/nest@17.2.8 --force
npm run nx -- g @nx/nest:application --directory=apps/server --name=server --projectNameAndRootFormat=as-provided --strict=true
cd ../../

npx --yes replace-json-property ./integrations/app/lib/schematics/package.json version 0.0.0
cd ./integrations/app/lib/schematics && npm pack . && cd ../../../../

cd ./integrations/app
npm install --save-dev --no-cache ../../integrations/app/lib/schematics/nestjs-mod-schematics-0.0.0.tgz --force
npm run nx -- g @nestjs-mod/schematics:application --directory=apps/server-mod --name=server-mod --projectNameAndRootFormat=as-provided --strict=true
npm run nx -- g @nestjs-mod/schematics:library feature --buildable --publishable --directory=libs/feature --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
npm i --force
npm run tsc:lint
npm run nx -- build feature

export PORT=3010
npm run nx -- build server
kill -9 $(lsof -t -i:$PORT) | echo "Killed"
node ./dist/apps/server/main.js &
(
    sleep 5 && npm run nx -- e2e server-e2e
)
sleep 5
kill -9 $(lsof -t -i:$PORT) | echo "Killed"

sleep 5

export PORT=3011
npm run nx -- build server-mod
kill -9 $(lsof -t -i:$PORT) | echo "Killed"
node ./dist/apps/server-mod/main.js &
(
    sleep 5 && npm run nx -- e2e server-mod-e2e
)
sleep 5
kill -9 $(lsof -t -i:$PORT) | echo "Killed"
