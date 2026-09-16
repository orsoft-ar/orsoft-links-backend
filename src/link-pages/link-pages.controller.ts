import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/get-user.decorator';
import { CreateLinkPageDto } from './dto/create-link-page.dto';
import { UpdateLinkPageDto } from './dto/update-link-page.dto';
import { LinkPagesService } from './link-pages.service';

@ApiTags('link-pages')
@ApiBearerAuth()
@Controller('link-pages')
export class LinkPagesController {
  constructor(private readonly linkPagesService: LinkPagesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi pagina de links' })
  @ApiResponse({ status: 200, description: 'La pagina del usuario autenticado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'El usuario no tiene pagina' })
  getMyPage(@GetUser('id') userId: number) {
    return this.linkPagesService.getMyPage(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear mi pagina de links' })
  @ApiResponse({ status: 201, description: 'Pagina creada' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 409, description: 'Username en uso o pagina ya existente' })
  @ApiBody({ type: CreateLinkPageDto })
  create(@GetUser() user: AuthenticatedUser, @Body() dto: CreateLinkPageDto) {
    return this.linkPagesService.create(user, dto);
  }

  @Put('me')
  @ApiOperation({ summary: 'Actualizar mi pagina de links' })
  @ApiResponse({ status: 200, description: 'Pagina actualizada' })
  @ApiResponse({ status: 409, description: 'Username en uso' })
  @ApiBody({ type: UpdateLinkPageDto })
  update(@GetUser('id') userId: number, @Body() dto: UpdateLinkPageDto) {
    return this.linkPagesService.update(userId, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Eliminar mi pagina de links' })
  @ApiResponse({ status: 200, description: 'Pagina eliminada' })
  delete(@GetUser('id') userId: number) {
    return this.linkPagesService.remove(userId);
  }
}