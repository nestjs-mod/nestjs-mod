import type { Tree } from '@nx/devkit';
import { updateJson } from '@nx/devkit';
import { constantCase } from 'case-anything';
import { join } from 'path';
import getPorts from './get-port.utils';
import { PackageJsonType, PackageJsonUtils } from './package-json.utils';

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

export function updateEslintRcJsonRoot(tree: Tree) {
  if (tree.exists('.eslintrc.json')) {
    updateJson(tree, '.eslintrc.json', (json) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json['overrides'] = json['overrides'].map((ov: any) => {
        if (ov.rules['@nx/enforce-module-boundaries'] && !ov.rules['@typescript-eslint/await-thenable']) {
          ov.rules['@typescript-eslint/await-thenable'] = 'error';
          ov.parserOptions = {
            project: ['tsconfig.*?.json'],
          };
        }
        return ov;
      });
      return json;
    });
  }
}

export function addScript(tree: Tree, projectName?: string) {
  updateJson(tree, 'package.json', (basicJson) => {
    const packageJsonUtils = new PackageJsonUtils();

    const jsonStructure: PackageJsonType | undefined = packageJsonUtils.toStructure(basicJson);
    packageJsonUtils.addScripts(
      'prod infra',
      {
        start: {
          commands: [`./node_modules/.bin/nx run-many --all -t=start`],
          comments: ['Launching a built NestJS application (you must first build it using the build command)'],
        },
        build: {
          commands: [
            'npm run generate',
            'npm run tsc:lint',
            `./node_modules/.bin/nx run-many --all -t=build --parallel=false`,
          ],
          comments: ['Building a NestJS application'],
        },
      },
      jsonStructure,
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'prod infra',
        {
          [`start:prod:${projectName}`]: {
            commands: [`./node_modules/.bin/nx start ${projectName}`],
            comments: [`Launching a built ${projectName} (you must first build it using the build command)`],
          },
        },
        jsonStructure,
      );
    }
    packageJsonUtils.addScripts(
      'docs',
      {
        'docs:infrastructure': {
          commands: [
            `export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --all -t=serve --parallel=false --watch=false --inspect=false`,
          ],
          comments: [
            'Creation of documentation for the entire infrastructure and creation of files necessary to launch the infrastructure',
          ],
        },
      },
      jsonStructure,
    );
    packageJsonUtils.addScripts(
      'dev infra',
      {
        'serve:dev': {
          commands: [`./node_modules/.bin/nx run-many --all -t=serve`],
          comments: ['Running NestJS application source code in watch mode'],
        },
      },
      jsonStructure,
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'dev infra',
        {
          [`serve:dev:${projectName}`]: {
            commands: [`./node_modules/.bin/nx serve ${projectName} --host=0.0.0.0`],
            comments: [`Running ${projectName} source code in watch mode`],
          },
        },
        jsonStructure,
      );
    }
    packageJsonUtils.addScripts(
      'lint',
      {
        lint: {
          commands: ['npm run tsc:lint', `./node_modules/.bin/nx run-many --all -t=lint --parallel=false`],
          comments: ['Checking the typescript code for the entire project'],
        },
        'lint:fix': {
          commands: ['npm run tsc:lint', `./node_modules/.bin/nx run-many --all -t=lint --fix --parallel=false`],
          comments: ['Checking the typescript code throughout the project and trying to fix everything possible'],
        },
        'tsc:lint': {
          commands: ['./node_modules/.bin/tsc --noEmit -p tsconfig.base.json'],
          comments: ['Checking typescript code in libraries'],
        },
      },
      jsonStructure,
    );
    packageJsonUtils.addScripts(
      'tests',
      {
        test: {
          commands: [
            `./node_modules/.bin/nx run-many --all -t=test --parallel=false --passWithNoTests --output-style=stream-without-prefixes`,
          ],
          comments: ['Running tests across the entire project'],
        },
      },
      jsonStructure,
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'tests',
        {
          [`test:${projectName}`]: {
            commands: [
              `./node_modules/.bin/nx test ${projectName} --parallel=false --passWithNoTests --output-style=stream-without-prefixes`,
            ],
            comments: [`Running tests for ${projectName}`],
          },
        },
        jsonStructure,
      );
    }

    packageJsonUtils.addScripts(
      'utils',
      {
        generate: {
          commands: [`./node_modules/.bin/nx run-many --all -t=generate --parallel=false`, 'npm run make-ts-list'],
          comments: [
            'Running the "generate" nx command in applications and libraries which can be customized at your discretion',
            'automatically generating an index.ts file for each library',
            'checking the code and trying to fix it',
          ],
        },
        tsc: {
          commands: ['tsc'],
          comments: [
            'Alias for running the tsc version locally, which is in the project (example: `npm run tsc -- --noEmit -p tsconfig.base.json`),',
            'in order not to install tsc globally in the operating system',
          ],
        },
        nx: {
          commands: ['nx'],
          comments: [
            'Alias for running the nx version locally, which is in the project (example: `./node_modules/.bin/nx dep-graph`),',
            'in order not to install nx globally in the operating system',
          ],
        },
        'dep-graph': {
          commands: ['./node_modules/.bin/nx dep-graph'],
          comments: ['Generating dependency diagrams for nx applications and libraries'],
        },
        'make-ts-list': {
          commands: [`./node_modules/.bin/rucken make-ts-list`],
          comments: ['Automatically generating an index.ts file for each library,'],
        },
        // "prepare": "npx -y husky install",
        'manual:prepare': {
          commands: ['npm run generate', 'npm run docs:infrastructure', 'npm run test'],
          comments: [
            'Preparing code, building code, creating infrastructure documentation',
            'and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)',
          ],
        },
        'update:nestjs-mod-versions': {
          commands: ['npx -y npm-check-updates @nestjs-mod/* nestjs-mod -u'],
          comments: ['Updating NestJS-mod libraries'],
        },
        rucken: {
          commands: ['rucken'],
          comments: [
            'Alias for console tools and scripts for nx and not only use to automate the workflow and',
            'speed up the development process (example: `npm run rucken -- make-ts-list`, site: https://www.npmjs.com/package/rucken)',
          ],
        },
      },
      jsonStructure,
    );

    if (!basicJson['lint-staged']) {
      basicJson['lint-staged'] = {
        '*.{js,ts}': 'eslint --fix',
      };
    }

    basicJson = packageJsonUtils.toPlain(basicJson, jsonStructure);

    return basicJson;
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
.nx/workspace-data
*.env
`;
  if (host.exists('.gitignore')) {
    const lines = needed.split('\n');
    const content = host.read('.gitignore', 'utf-8') || '';
    const contentArray = content.split('\n');

    let changed = false;
    for (const line of lines) {
      if (!contentArray?.includes(line) && !contentArray?.includes(`# ${line}`)) {
        if (changed === false) {
          contentArray.push('');
        }
        contentArray.push(line);
        changed = true;
      }
    }
    if (changed) {
      host.write('.gitignore', contentArray.join('\n'));
    }
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
.nx/workspace-data
*.env
`;

  if (host.exists('.nxignore')) {
    const lines = needed.split('\n');
    const content = host.read('.nxignore', 'utf-8') || '';
    const contentArray = content.split('\n');

    let changed = false;
    for (const line of lines) {
      if (!contentArray?.includes(line) && !contentArray?.includes(`# ${line}`)) {
        if (changed === false) {
          contentArray.push('');
        }
        contentArray.push(line);
        changed = true;
      }
    }
    if (changed) {
      host.write('.nxignore', contentArray.join('\n'));
    }
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
  },
  "devScripts": [
    "manual:prepare",
    "serve:dev:${projectName}"
  ],
  "prodScripts": [
    "manual:prepare",
    "start:prod:${projectName}"
  ],
  "testsScripts": [
    "test:${projectName}"
  ]
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
      "test-setup.ts",
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
