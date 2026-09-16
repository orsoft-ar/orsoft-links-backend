import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateLinkDto } from './dto/create-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { UpdateLinkStatusDto } from './dto/update-link-status.dto';
import { LinksService } from './links.service';

@ApiTags('links')
@ApiBearerAuth()
@Controller('link-pages/me/links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener los links de mi pagina' })
  @ApiResponse({ status: 200, description: 'Links ordenados por posicion' })
  getMyLinks(@GetUser('id') userId: number) {
    return this.linksService.getMyLinks(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un link en mi pagina' })
  @ApiResponse({ status: 201, description: 'Link creado con posicion automatica' })
  @ApiResponse({ status: 404, description: 'Sin pagina creada' })
  @ApiBody({ type: CreateLinkDto })
  createLink(@GetUser('id') userId: number, @Body() dto: CreateLinkDto) {
    return this.linksService.create(userId, dto);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reordenar los links de mi pagina' })
  @ApiResponse({ status: 200, description: 'Links reordenados' })
  @ApiResponse({ status: 404, description: 'Algun link no pertenece a la pagina' })
  @ApiBody({ type: ReorderLinksDto })
  reorderLinks(@GetUser('id') userId: number, @Body() dto: ReorderLinksDto) {
    return this.linksService.reorder(userId, dto);
  }

  @Put(':id')
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

  @Patch(':id/status')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un link de mi pagina' })
  @ApiParam({ name: 'id', description: 'ID del link' })
  @ApiResponse({ status: 200, description: 'Link eliminado' })
  @ApiResponse({ status: 404, description: 'Link inexistente' })
  deleteLink(@GetUser('id') userId: number, @Param('id', ParseIntPipe) linkId: number) {
    return this.linksService.remove(userId, linkId);
  }
}
