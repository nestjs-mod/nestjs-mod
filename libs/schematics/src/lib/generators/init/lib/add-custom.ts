import type { Tree } from '@nrwl/devkit';
import { updateJson } from '@nrwl/devkit';
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

export function addScript(tree: Tree, projectName?: string) {
  updateJson(tree, 'package.json', (basicJson) => {
    const packageJsonUtils = new PackageJsonUtils();

    const jsonStructure: PackageJsonType | undefined = packageJsonUtils.toStructure(basicJson);
    packageJsonUtils.addScripts(
      'prod infra',
      {
        start: {
          commands: [`npm run nx:many -- -t=start`],
          comments: ['Launching a built NestJS application (you must first build it using the build command)'],
        },
        build: {
          commands: ['npm run generate', 'npm run tsc:lint', 'npm run nx:many -- -t=build --skip-nx-cache=true'],
          comments: ['Building a NestJS application'],
        },
      },
      jsonStructure
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'prod infra',
        {
          [`start:prod:${projectName}`]: {
            commands: [`npm run nx -- start ${projectName}`],
            comments: [`Launching a built ${projectName} (you must first build it using the build command)`],
          },
        },
        jsonStructure
      );
    }
    packageJsonUtils.addScripts(
      'docs',
      {
        'docs:infrastructure': {
          commands: ['export NODE_ENV=infrastructure && npm run nx:many -- -t=start --parallel=1'],
          comments: [
            'Creation of documentation for the entire infrastructure and creation of files necessary to launch the infrastructure',
          ],
        },
      },
      jsonStructure
    );
    packageJsonUtils.addScripts(
      'dev infra',
      {
        'serve:dev': {
          commands: ['npm run nx:many -- -t=serve'],
          comments: ['Running NestJS application source code in watch mode'],
        },
      },
      jsonStructure
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'dev infra',
        {
          [`serve:dev:${projectName}`]: {
            commands: [`npm run nx -- serve ${projectName} --host=0.0.0.0`],
            comments: [`Running ${projectName} source code in watch mode`],
          },
        },
        jsonStructure
      );
    }
    packageJsonUtils.addScripts(
      'lint',
      {
        lint: {
          commands: ['npm run tsc:lint', 'npm run nx:many -- -t=lint'],
          comments: ['Checking the typescript code for the entire project'],
        },
        'lint:fix': {
          commands: ['npm run tsc:lint', 'npm run nx:many -- -t=lint --fix'],
          comments: ['Checking the typescript code throughout the project and trying to fix everything possible'],
        },
        'tsc:lint': {
          commands: ['npm run tsc -- --noEmit -p tsconfig.base.json'],
          comments: ['Checking typescript code in libraries'],
        },
      },
      jsonStructure
    );
    packageJsonUtils.addScripts(
      'tests',
      {
        test: {
          commands: [
            'npm run nx:many -- -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes',
          ],
          comments: ['Running tests across the entire project'],
        },
      },
      jsonStructure
    );
    if (projectName) {
      packageJsonUtils.addScripts(
        'tests',
        {
          [`test:${projectName}`]: {
            commands: [
              `npm run nx -- test ${projectName} --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes`,
            ],
            comments: [`Running tests for ${projectName}`],
          },
        },
        jsonStructure
      );
    }

    packageJsonUtils.addScripts(
      'utils',
      {
        generate: {
          commands: ['npm run nx:many -- -t=generate --skip-nx-cache=true', 'npm run make-ts-list', 'npm run lint:fix'],
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
            'Alias for running the nx version locally, which is in the project (example: `npm run nx -- dep-graph`),',
            'in order not to install nx globally in the operating system',
          ],
        },
        'dep-graph': {
          commands: ['npm run nx -- dep-graph'],
          comments: ['Generating dependency diagrams for nx applications and libraries'],
        },
        'nx:many': {
          commands: [`npm run nx -- run-many --exclude=${basicJson.name} --all`],
          comments: [
            'Alias for running many nx commands (example: `npm run nx:many -- -t=lint`),',
            'an exception has been added for the root project,',
            'since sometimes an attempt to run an nx command on it can lead to the command freezing',
          ],
        },
        'make-ts-list': {
          commands: [`./node_modules/.bin/rucken make-ts-list`],
          comments: [
            'Automatically generating an index.ts file for each library,',
            'works only for nx applications created using the `--projectNameAndRootFormat=as-provided` flag',
          ],
        },
        // "prepare": "npx -y husky install",
        'manual:prepare': {
          commands: ['npm run generate', 'npm run build', 'npm run docs:infrastructure', 'npm run test'],
          comments: [
            'Preparing code, building code, creating infrastructure documentation',
            'and all the files necessary to raise the infrastructure and running tests (generate, build, docs:infrastructure, test)',
          ],
        },
        rucken: {
          commands: ['rucken'],
          comments: [
            'Alias for console tools and scripts for nx and not only use to automate the workflow and',
            'speed up the development process (example: `npm run rucken -- make-ts-list`, site: https://www.npmjs.com/package/rucken)',
          ],
        },
      },
      jsonStructure
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
  },
  "devScripts": [
    "generate",
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
