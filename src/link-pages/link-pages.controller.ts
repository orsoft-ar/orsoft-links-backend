import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/get-user.decorator';
import { LinkPagesService } from './link-pages.service';
import { CreateLinkPageDto } from './dto/create-link-page.dto';
import { UpdateLinkPageDto } from './dto/update-link-page.dto';
import { LinksService } from '../links/links.service';
import { CreateLinkDto } from '../links/dto/create-link.dto';
import { UpdateLinkDto } from '../links/dto/update-link.dto';
import { UpdateLinkStatusDto } from '../links/dto/update-link-status.dto';
import { ReorderLinksDto } from '../links/dto/reorder-links.dto';

@ApiTags('link-pages')
@ApiBearerAuth()
@Controller('link-pages')
export class LinkPagesController {
  constructor(
    private readonly linkPagesService: LinkPagesService,
    private readonly linksService: LinksService,
  ) {}

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

  @Get('me/links')
  @ApiOperation({ summary: 'Obtener los links de mi pagina' })
  @ApiResponse({ status: 200, description: 'Links ordenados por posicion' })
  getMyLinks(@GetUser('id') userId: number) {
    return this.linksService.getMyLinks(userId);
  }

  @Post('me/links')
  @ApiOperation({ summary: 'Crear un link en mi pagina' })
  @ApiResponse({ status: 201, description: 'Link creado con posicion automatica' })
  @ApiResponse({ status: 404, description: 'Sin pagina creada' })
  @ApiBody({ type: CreateLinkDto })
  createLink(@GetUser('id') userId: number, @Body() dto: CreateLinkDto) {
    return this.linksService.create(userId, dto);
  }

  @Put('me/links/reorder')
  @ApiOperation({ summary: 'Reordenar los links de mi pagina' })
  @ApiResponse({ status: 200, description: 'Links reordenados' })
  @ApiResponse({ status: 404, description: 'Algun link no pertenece a la pagina' })
  @ApiBody({ type: ReorderLinksDto })
  reorderLinks(@GetUser('id') userId: number, @Body() dto: ReorderLinksDto) {
    return this.linksService.reorder(userId, dto);
  }

  @Put('me/links/:id')
  @ApiOperation({ summary: 'Editar un link de mi pagina' })
  @ApiParam({ name: 'id', description: 'ID del link' })
  @ApiResponse({ status: 200, description: 'Link editado' })
  @ApiResponse({ status: 404, description: 'Link inexistente' })
  @ApiBody({ type: UpdateLinkDto })
  updateLink(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
    @Body() dto: UpdateLinkDto,
  ) {
    return this.linksService.update(userId, linkId, dto);
  }

  @Patch('me/links/:id/status')
  @ApiOperation({ summary: 'Activar o desactivar un link' })
  @ApiParam({ name: 'id', description: 'ID del link' })
  @ApiResponse({ status: 200, description: 'Estado del link actualizado' })
  @ApiBody({ type: UpdateLinkStatusDto })
  updateLinkStatus(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
    @Body() dto: UpdateLinkStatusDto,
  ) {
    return this.linksService.updateStatus(userId, linkId, dto);
  }

  @Delete('me/links/:id')
  @ApiOperation({ summary: 'Eliminar un link de mi pagina' })
  @ApiParam({ name: 'id', description: 'ID del link' })
  @ApiResponse({ status: 200, description: 'Link eliminado' })
  @ApiResponse({ status: 404, description: 'Link inexistente' })
  deleteLink(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) linkId: number,
  ) {
    return this.linksService.remove(userId, linkId);
  }
}