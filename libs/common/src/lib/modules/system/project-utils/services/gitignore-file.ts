import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class GitignoreService {
  constructor(private readonly packageJsonService: PackageJsonService) {}

  addGitIgnoreEntry(lines: string[]) {
    if (isInfrastructureMode()) {
      const packageJson = this.packageJsonService.read();
      const packageJsonFilePath = this.packageJsonService.getPackageJsonFilePath();
      if (packageJson && packageJsonFilePath) {
        const gitignoreFilePath = `${dirname(packageJsonFilePath)}/.gitignore`;
        if (existsSync(gitignoreFilePath)) {
          let content = readFileSync(gitignoreFilePath, 'utf-8').toString();

          let changed = false;
          for (const line of lines) {
            if (!content?.includes(line)) {
              content = `${content}\n${line}\n`;
              changed = true;
            }
          }
          if (changed) {
            if (!gitignoreFilePath) {
              return;
            }
            const fileDir = dirname(gitignoreFilePath);
            if (!existsSync(fileDir)) {
              mkdirSync(fileDir, { recursive: true });
            }
            writeFileSync(gitignoreFilePath, content);
          }
        }
      }
    }
  }
}
