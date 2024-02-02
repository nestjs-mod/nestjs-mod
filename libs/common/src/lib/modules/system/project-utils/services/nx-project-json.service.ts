import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { GENERATE_TARGET_NAME, PROJECT_JSON_FILE } from '../project-utils.constants';
import { JSONSchemaForNxProjects } from '../project-utils.types';
import { ApplicationPackageJsonService } from './application-package-json.service';
import { DotEnvService } from './dot-env.service';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class NxProjectJsonService {
  constructor(
    private readonly projectUtilsConfiguration: ProjectUtilsConfiguration,
    private readonly applicationPackageJsonService: ApplicationPackageJsonService,
    private readonly packageJsonService: PackageJsonService,
    private readonly dotEnvService: DotEnvService
  ) {}

  getNxProjectJsonFilePath() {
    if (this.projectUtilsConfiguration.nxProjectJsonFile) {
      return this.projectUtilsConfiguration.nxProjectJsonFile;
    }
    const applicationPackageJsonFilePath = this.applicationPackageJsonService.getPackageJsonFilePath();
    if (applicationPackageJsonFilePath) {
      return join(dirname(applicationPackageJsonFilePath), PROJECT_JSON_FILE);
    }
    return undefined;
  }

  async addRunCommands(lines: string[], targetName = GENERATE_TARGET_NAME) {
    const projectJson = (await this.read()) || {};
    if (!projectJson?.targets) {
      projectJson.targets = {};
    }
    if (!projectJson.targets[targetName]) {
      projectJson.targets[targetName] = {};
    }
    if (!projectJson.targets[targetName]) {
      projectJson.targets[targetName] = {};
    }
    if (!projectJson.targets[targetName].executor) {
      projectJson.targets[targetName].executor = 'nx:run-commands';
    }
    if (!projectJson.targets[targetName].options) {
      projectJson.targets[targetName].options = {};
    }
    if (!projectJson.targets[targetName].options!['commands']) {
      projectJson.targets[targetName].options!['commands'] = [];
    }
    for (const line of lines) {
      if (!(projectJson.targets[targetName].options!['commands'] as string[])!.some((c) => c === line)) {
        (projectJson.targets[targetName].options!['commands'] as string[]).push(line);
      }
    }
    if (!projectJson.targets[targetName].options!['parallel']) {
      projectJson.targets[targetName].options!['parallel'] = false;
    }
    const dotEnvFile = this.dotEnvService.getEnvFilePath();
    const packageJson = this.packageJsonService.getPackageJsonFilePath();
    if (
      dotEnvFile &&
      existsSync(dotEnvFile) &&
      packageJson &&
      existsSync(packageJson) &&
      !projectJson.targets[targetName].options!['envFile']
    ) {
      projectJson.targets[targetName].options!['envFile'] = `.${dotEnvFile.replace(dirname(packageJson), '')}`;
    }
    if (!projectJson.targets[targetName].options!['color']) {
      projectJson.targets[targetName].options!['color'] = true;
    }
    await this.write(projectJson);
  }

  async readFile(nxProjectJsonFile: string): Promise<JSONSchemaForNxProjects | undefined> {
    try {
      return JSON.parse((await readFile(nxProjectJsonFile)).toString());
    } catch (err) {
      return undefined;
    }
  }

  async writeFile(nxProjectJsonFile: string, data: JSONSchemaForNxProjects) {
    try {
      if (!nxProjectJsonFile) {
        return;
      }
      const fileDir = dirname(nxProjectJsonFile);
      if (!existsSync(fileDir)) {
        await mkdir(fileDir, { recursive: true });
      }
      await writeFile(nxProjectJsonFile, JSON.stringify(data, null, 2));
    } catch (err) {
      //
    }
  }

  async read(): Promise<JSONSchemaForNxProjects | undefined> {
    const nxProjectJsonFile = this.getNxProjectJsonFilePath();
    if (!nxProjectJsonFile) {
      return undefined;
    }
    return await this.readFile(nxProjectJsonFile);
  }

  async write(data: JSONSchemaForNxProjects) {
    const nxProjectJsonFile = this.getNxProjectJsonFilePath();
    if (!nxProjectJsonFile) {
      return;
    }
    const fileDir = dirname(nxProjectJsonFile);
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true });
    }
    await this.writeFile(nxProjectJsonFile, data);
  }
}
