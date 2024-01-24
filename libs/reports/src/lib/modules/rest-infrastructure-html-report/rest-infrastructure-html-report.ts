import {
  InfrastructureMarkdownReportStorage,
  InfrastructureMarkdownReportStorageService,
  NestModuleCategory,
  createNestModule,
} from '@nestjs-mod/common';
import { Controller, Get } from '@nestjs/common';
import markdownit from 'markdown-it';

@Controller()
class RestInfrastructureHtmlReportController {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorageService) {}
  @Get('report')
  async getReport(): Promise<string> {
    const md = markdownit({
      html: true,
      linkify: true,
      typographer: true,
    });
    return md.render(this.infrastructureMarkdownReportStorage.report);
  }
}

export const { RestInfrastructureHtmlReport } = createNestModule({
  moduleName: 'RestInfrastructureHtmlReport',
  moduleDescription: 'Rest infrastructure HTML-report',
  imports: [InfrastructureMarkdownReportStorage.forFeature({ featureModuleName: 'RestInfrastructureHtmlReport' })],
  controllers: [RestInfrastructureHtmlReportController],
  moduleCategory: NestModuleCategory.infrastructure,
});
