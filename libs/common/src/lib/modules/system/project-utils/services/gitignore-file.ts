import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class GitignoreService {
  constructor(private readonly packageJsonService: PackageJsonService) {}

  async addGitIgnoreEntry(lines: string[]) {
    const packageJson = await this.packageJsonService.read();
    const packageJsonFilePath = this.packageJsonService.getPackageJsonFilePath();
    if (packageJson && packageJsonFilePath) {
      const gitignoreFilePath = `${dirname(packageJsonFilePath)}/.gitignore`;
      if (existsSync(gitignoreFilePath)) {
        let content = (await readFile(gitignoreFilePath, 'utf-8')).toString();

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
            await mkdir(fileDir, { recursive: true });
          }
          await writeFile(gitignoreFilePath, content);
        }
      }
    }
  }
}
