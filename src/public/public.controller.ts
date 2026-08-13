import {
  Controller,
  Get,
  Header,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get('links/:username')
  @ApiOperation({ summary: 'Pagina publica de links de un usuario' })
  @ApiParam({ name: 'username', example: 'mateo', description: 'Username de la pagina' })
  @ApiResponse({ status: 200, description: 'Datos publicos con links activos ordenados' })
  @ApiResponse({ status: 404, description: 'La pagina no existe o no es publica' })
  getPublicPage(@Param('username') username: string) {
    return this.publicService.getPublicPage(username);
  }

  @Public()
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Sitemap XML con las paginas publicas' })
  @ApiResponse({ status: 200, description: 'Sitemap en formato XML' })
  async getSitemap(): Promise<string> {
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ??
      'https://linkorsoft.site'
    ).replace(/\/$/, '');

    const pages = await this.publicService.getSitemapPages();

    const staticEntries = [
      { path: '/', lastmod: undefined, priority: '1.0' },
      { path: '/login', lastmod: undefined, priority: '0.3' },
      { path: '/register', lastmod: undefined, priority: '0.5' },
    ];

    const entries = [
      ...staticEntries.map((entry) => {
        const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>\n` : '';
        return `  <url>
    <loc>${frontendUrl}${entry.path}</loc>
${lastmod}    <changefreq>weekly</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
      }),
      ...pages.map((page) => {
        const lastmod = page.updatedAt.toISOString();
        return `  <url>
    <loc>${frontendUrl}/${escapeXml(page.username)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }),
    ].join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
