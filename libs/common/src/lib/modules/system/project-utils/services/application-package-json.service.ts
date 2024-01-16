import { Injectable } from '@nestjs/common';
import { ProjectUtilsConfiguration } from '../project-utils.configuration';
import { PackageJsonType } from '../project-utils.types';
import { PackageJsonService } from './package-json.service';

@Injectable()
export class ApplicationPackageJsonService extends PackageJsonService {
  constructor(protected override readonly projectUtilsConfiguration: ProjectUtilsConfiguration) {
    super(projectUtilsConfiguration);
  }

  override getPackageJsonFilePath() {
    return this.projectUtilsConfiguration.applicationPackageJsonFile;
  }

  override async read(): Promise<PackageJsonType | undefined> {
    return super.read();
  }

  override async write(data: PackageJsonType) {
    super.write(data);
  }
}
