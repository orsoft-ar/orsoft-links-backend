import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('links/:username')
  @ApiOperation({ summary: 'Pagina publica de links de un usuario' })
  @ApiParam({ name: 'username', example: 'mateo', description: 'Username de la pagina' })
  @ApiResponse({ status: 200, description: 'Datos publicos con links activos ordenados' })
  @ApiResponse({ status: 404, description: 'La pagina no existe o no es publica' })
  getPublicPage(@Param('username') username: string) {
    return this.publicService.getPublicPage(username);
  }
}