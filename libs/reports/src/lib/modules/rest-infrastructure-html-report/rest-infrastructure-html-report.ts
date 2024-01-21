import {
  InfrastructureMarkdownReport,
  InfrastructureMarkdownReportStorage,
  NestModuleCategory,
  createNestModule,
} from '@nestjs-mod/common';
import { Controller, Get } from '@nestjs/common';
import markdownit from 'markdown-it';

@Controller()
class RestInfrastructureHtmlReportController {
  constructor(private readonly infrastructureMarkdownReportStorage: InfrastructureMarkdownReportStorage) {}
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
  imports: [InfrastructureMarkdownReport.forFeature({ featureModuleName: 'RestInfrastructureHtmlReport' })],
  controllers: [RestInfrastructureHtmlReportController],
  moduleCategory: NestModuleCategory.infrastructure,
});
