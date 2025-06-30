import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class GitignoreService {
  constructor(private readonly packageJsonService: PackageJsonService) {}

  addGitIgnoreEntry(lines: string[]) {
    const packageJson = this.packageJsonService.read();
    const packageJsonFilePath = this.packageJsonService.getPackageJsonFilePath();
    if (packageJson && packageJsonFilePath) {
      const gitignoreFilePath = `${dirname(packageJsonFilePath)}/.gitignore`;
      if (existsSync(gitignoreFilePath)) {
        const content = readFileSync(gitignoreFilePath, 'utf-8').toString();
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
          if (!gitignoreFilePath) {
            return;
          }
          if (isInfrastructureMode()) {
            const fileDir = dirname(gitignoreFilePath);
            if (!existsSync(fileDir)) {
              mkdirSync(fileDir, { recursive: true });
            }
            writeFileSync(gitignoreFilePath, contentArray.join('\n'));
          }
        }
      }
    }
  }
}
