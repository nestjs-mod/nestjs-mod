const { writeFile, readFile } = require("fs/promises");
const { join } = require("path");
async function main() {
    const json = JSON.parse((await readFile(join(__dirname, 'package.json'))).toString())
    await writeFile(join(__dirname, '..', '..', 'libs/schematics/src/lib/utils/versions.ts'), `export const nestJsVersion = '^10.0.2';
export const nestJsSchematicsVersion = '^10.0.1';
export const rxjsVersion = '^7.8.0';
export const reflectMetadataVersion = '^0.1.13';
export const tsLibVersion = '^2.3.0';

export const nestJsModDeps = ${JSON.stringify(json.dependencies, null, 2).split('"').join(`'`)};
export const nestJsModDevDeps = ${JSON.stringify(json.devDependencies, null, 2).split('"').join(`'`)};
`)
}

main()