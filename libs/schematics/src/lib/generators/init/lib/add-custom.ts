import { merge } from '@nestjs-mod/common';
import type { Tree } from '@nrwl/devkit';
import { updateJson } from '@nrwl/devkit';
import { constantCase } from 'case-anything';
import { join } from 'path';
import getPorts from './get-port.utils';
import { PackageJsonUtils, SCRIPTS_KEY_NAME } from './package-json.utils';

export function updateTsConfigRoot(tree: Tree) {
  if (tree.exists('tsconfig.base.json')) {
    updateJson(tree, 'tsconfig.base.json', (json) => {
      json['compilerOptions'] = {
        ...json['compilerOptions'],
        emitDecoratorMetadata: true,
        experimentalDecorators: true,

        skipLibCheck: true,
        skipDefaultLibCheck: true,
        allowJs: true,
        allowSyntheticDefaultImports: true,
        noImplicitOverride: true,
        noImplicitReturns: true,
        esModuleInterop: true,
        noImplicitAny: false,
      };
      return json;
    });
  }
}

export function addScript(tree: Tree, projectName?: string) {
  updateJson(tree, 'package.json', (json) => {
    if (!projectName) {
      const packageJsonUtils = new PackageJsonUtils();
      const jsonStructure = packageJsonUtils.toStructure(json);

      if (!jsonStructure[SCRIPTS_KEY_NAME]!['prod infra']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['docs']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['docs'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['dev infra']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['lint']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['lint'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['tests']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['tests'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['utils']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['utils'] = {};
      }

      jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'], {
        start: 'npm run nx:many -- -t=start',
        build: 'npm run tsc:lint && npm run nx:many -- -t=build --skip-nx-cache=true',
      });

      jsonStructure[SCRIPTS_KEY_NAME]!['docs'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['docs'], {
        'docs:infrastructure': 'export NODE_ENV=infrastructure && npm run nx:many -- -t=start --parallel=1',
      });

      jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'], {
        'serve:dev': 'npm run nx:many -- -t=serve --host=0.0.0.0',
      });
      jsonStructure[SCRIPTS_KEY_NAME]!['lint'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['lint'], {
        lint: 'npm run tsc:lint && npm run nx:many -- -t=lint',
        'lint:fix': 'npm run tsc:lint && npm run nx:many -- -t=lint --fix',
        'tsc:lint': 'tsc --noEmit -p tsconfig.base.json',
      });
      jsonStructure[SCRIPTS_KEY_NAME]!['tests'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['tests'], {
        test: 'npm run nx:many -- -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes',
      });
      jsonStructure[SCRIPTS_KEY_NAME]!['utils'] = merge(jsonStructure[SCRIPTS_KEY_NAME]!['utils'], {
        generate: 'npm run nx:many -- -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix',
        nx: 'nx',
        'dep-graph': 'npm run nx -- dep-graph',
        'nx:many': `npm run nx -- run-many --exclude=${json.name} --all`,
        'make-ts-list': './node_modules/.bin/rucken make-ts-list',
        prepare: 'husky install',
        'manual:prepare': 'npm run generate && npm run build && npm run docs:infrastructure && npm run test',
      });

      if (!json['lint-staged']) {
        json['lint-staged'] = {
          '*.{js,ts}': 'eslint --fix',
        };
      }

      json = packageJsonUtils.toPlain(json);
    } else {
      const packageJsonUtils = new PackageJsonUtils();
      const jsonStructure = packageJsonUtils.toStructure(json);
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['dev infra']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['prod infra']) {
        jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'] = {};
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'][`serve:dev:${projectName}`]) {
        jsonStructure[SCRIPTS_KEY_NAME]!['dev infra'][
          `serve:dev:${projectName}`
        ] = `npm run nx -- serve ${projectName} --host=0.0.0.0`;
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'][`start:prod:${projectName}`]) {
        jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'][
          `start:prod:${projectName}`
        ] = `npm run nx -- start ${projectName} --host=0.0.0.0`;
      }
      if (!jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'][`build:prod:${projectName}`]) {
        jsonStructure[SCRIPTS_KEY_NAME]!['prod infra'][
          `build:prod:${projectName}`
        ] = `npm run nx -- build ${projectName}`;
      }
      json = packageJsonUtils.toPlain(json);
    }
    return json;
  });
}

export function addGitIgnoreEntry(host: Tree) {
  const needed = `# See http://help.github.com/ignore-files/ for more about ignoring files.

# compiled output
dist
tmp
/out-tsc

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

.clinic

.nx/cache
*.env
`;
  if (host.exists('.gitignore')) {
    let content = host.read('.gitignore', 'utf-8');

    if (!content?.includes('node_modules')) {
      content = `${content}\n${needed}\n`;
    }
    host.write('.gitignore', content);
  } else {
    host.write('.gitignore', `${needed}\n`);
  }
}

export function addNxIgnoreEntry(host: Tree) {
  const needed = `# See http://help.github.com/ignore-files/ for more about ignoring files.

# compiled output
dist
tmp
/out-tsc

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

.clinic

.nx/cache
*.env
`;
  if (host.exists('.nxignore')) {
    let content = host.read('.nxignore', 'utf-8');

    if (!content?.includes('node_modules')) {
      content = `${content}\n${needed}\n`;
    }
    host.write('.nxignore', content);
  } else {
    host.write('.nxignore', `${needed}\n`);
  }
}

export async function addEnvFile(host: Tree, projectName: string) {
  const port = await getPorts({ port: 3000 });
  const needed = `${`${constantCase(projectName)}_PORT=${port}`}`;
  if (host.exists('.env')) {
    let content = host.read('.env', 'utf-8');

    if (!content?.includes(needed)) {
      content = `${content}\n${needed}\n`;
    }
    host.write('.env', content);
  } else {
    host.write('.env', `${needed}\n`);
  }
}

export function addAppPackageJsonFile(host: Tree, projectName: string, projectPath: string) {
  const needed = `{
  "name": "${projectName}",
  "scripts": {},
  "dependencies": {
    "pm2": ">=5.3.0",
    "dotenv": ">=16.3.1"
  }
}`;
  if (host.exists(join(projectPath, 'package.json'))) {
    let content = host.read('package.json', 'utf-8');

    if (!content?.includes('"name":')) {
      content = needed;
      host.write(join(projectPath, 'package.json'), content);
    }
  } else {
    host.write(join(projectPath, 'package.json'), needed);
  }
}

export function addRuckenFile(host: Tree) {
  const needed = `{
  "makeTsList": {
    "indexFileName": "index",
    "excludes": [
      "*node_modules*",
      "*public_api.ts*",
      "*.spec*",
      "environment*",
      "*e2e*",
      "*.stories.ts",
      "*.d.ts"
    ]
  }
}`;
  if (host.exists('rucken.json')) {
    let content = host.read('rucken.json', 'utf-8');
    if (!content?.includes('"makeTsList":')) {
      content = needed;
      host.write('rucken.json', content);
    }
  } else {
    host.write('rucken.json', needed);
  }
}
