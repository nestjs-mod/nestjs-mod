import { readFileSync } from 'fs';
import { join } from 'path';
import { PackageJson } from '../types/package-json';

export function getPackageJson() {
  let packageJson: PackageJson;
  try {
    packageJson = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json')).toString());
  } catch (error) {
    packageJson = {};
  }
  return packageJson;
}
