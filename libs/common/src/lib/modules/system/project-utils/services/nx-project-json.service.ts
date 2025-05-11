import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { isInfrastructureMode } from '../../../../utils/is-infrastructure';
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
  ) { }

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

  addRunCommands(
    /**
     * Command lines for append
     */
    lines: string[],
    /**
     * Name of the target where you need to add it; if it does not exist, it will be created automatically
     */
    targetName = GENERATE_TARGET_NAME,
    /**
     * A line to check whether to add, by default it searches for each command to add
     */
    searchCommand?: string,
    customNxProjectJsonFile?: string
  ) {
    const projectJson = this.read(customNxProjectJsonFile) || {};
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
      if (!lines.find(line => (projectJson.targets![targetName].options!['commands'] as string[]).find(c => c === line))) {
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
    this.write(projectJson, customNxProjectJsonFile);
  }

  readFile(nxProjectJsonFile: string): JSONSchemaForNxProjects | undefined {
    try {
      return JSON.parse(readFileSync(nxProjectJsonFile).toString());
    } catch (err) {
      return undefined;
    }
  }

  writeFile(nxProjectJsonFile: string, data: JSONSchemaForNxProjects) {
    try {
      if (!nxProjectJsonFile) {
        return;
      }
      const fileDir = dirname(nxProjectJsonFile);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      writeFileSync(nxProjectJsonFile, JSON.stringify(data, null, 2));
    } catch (err) {
      //
    }
  }

  read(customNxProjectJsonFile?: string): JSONSchemaForNxProjects | undefined {
    const nxProjectJsonFile = customNxProjectJsonFile || this.getNxProjectJsonFilePath();
    if (!nxProjectJsonFile) {
      return undefined;
    }
    return this.readFile(nxProjectJsonFile);
  }

  write(data: JSONSchemaForNxProjects, customNxProjectJsonFile?: string) {
    const nxProjectJsonFile = customNxProjectJsonFile || this.getNxProjectJsonFilePath();
    if (!nxProjectJsonFile) {
      return;
    }
    if (isInfrastructureMode()) {
      const fileDir = dirname(nxProjectJsonFile);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      this.writeFile(nxProjectJsonFile, data);
    }
  }
}
