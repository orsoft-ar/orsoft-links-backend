import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { LinkPage } from '../link-pages/entities/link-page.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { UpdateLinkStatusDto } from './dto/update-link-status.dto';
import { Link } from './entities/link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    @InjectRepository(LinkPage)
    private readonly linkPagesRepository: Repository<LinkPage>,
    private readonly dataSource: DataSource,
  ) {}

  private async findOwnedPage(userId: number): Promise<LinkPage> {
    const page = await this.linkPagesRepository.findOne({ where: { userId } });
    if (!page) {
      throw new NotFoundException('Aun no tienes una pagina de links');
    }
    return page;
  }

  async getMyLinks(userId: number): Promise<Link[]> {
    const page = await this.findOwnedPage(userId);
    return this.linksRepository.find({
      where: { linkPageId: page.id },
      order: { position: 'ASC' },
    });
  }

  async create(userId: number, dto: CreateLinkDto): Promise<Link> {
    return this.dataSource.transaction(async (manager) => {
      const linkPagesRepo = manager.getRepository(LinkPage);
      const linksRepo = manager.getRepository(Link);

      const page = await linkPagesRepo.findOne({ where: { userId } });
      if (!page) {
        throw new NotFoundException('Aun no tienes una pagina de links');
      }

      const lastLink = await linksRepo.findOne({
        where: { linkPageId: page.id },
        order: { position: 'DESC' },
      });

      const total = await linksRepo.count({ where: { linkPageId: page.id } });
      if (total >= 50) {
        throw new BadRequestException('Máximo 50 links por página');
      }

      const link = linksRepo.create({
        linkPageId: page.id,
        title: dto.title,
        url: dto.url,
        icon: dto.icon ?? 'globe',
        position: lastLink ? lastLink.position + 1 : 1,
        active: true,
      });

      return linksRepo.save(link);
    });
  }

  async update(userId: number, linkId: number, dto: UpdateLinkDto): Promise<Link> {
    const link = await this.getOwnedLink(userId, linkId);

    if (dto.title !== undefined) link.title = dto.title;
    if (dto.url !== undefined) link.url = dto.url;
    if (dto.icon !== undefined) link.icon = dto.icon;
    if (dto.position !== undefined) link.position = dto.position;

    return this.linksRepository.save(link);
  }

  async updateStatus(
    userId: number,
    linkId: number,
    dto: UpdateLinkStatusDto,
  ): Promise<Link> {
    const link = await this.getOwnedLink(userId, linkId);
    link.active = dto.active;
    return this.linksRepository.save(link);
  }

  async remove(userId: number, linkId: number): Promise<{ deleted: boolean }> {
    const link = await this.getOwnedLink(userId, linkId);
    await this.linksRepository.remove(link);
    return { deleted: true };
  }

  async reorder(userId: number, dto: ReorderLinksDto): Promise<Link[]> {
    const positions = dto.links.map((l) => l.position);
    if (new Set(positions).size !== positions.length) {
      throw new BadRequestException('Posiciones duplicadas');
    }

    return this.dataSource.transaction(async (manager) => {
      const linkPagesRepo = manager.getRepository(LinkPage);
      const linksRepo = manager.getRepository(Link);

      const page = await linkPagesRepo.findOne({ where: { userId } });
      if (!page) throw new NotFoundException('Aun no tienes una pagina de links');

      const existingLinks = await linksRepo.find({
        where: { id: In(dto.links.map((item) => item.id)) },
        relations: { linkPage: true },
      });

      const foundIds = new Set(existingLinks.map((link) => link.id));

      for (const item of dto.links) {
        if (!foundIds.has(item.id)) {
          throw new NotFoundException('Uno o mas links no existen');
        }
        const link = existingLinks.find((l) => l.id === item.id)!;
        if (link.linkPage.userId !== userId) {
          throw new ForbiddenException('No tienes permiso para modificar ese link');
        }
      }

      const positionById = new Map(dto.links.map((item) => [item.id, item.position]));

      for (const link of existingLinks) {
        const pos = positionById.get(link.id);
        if (pos === undefined) throw new BadRequestException('Posición faltante');
        link.position = pos;
      }

      await linksRepo.save(existingLinks);

      return linksRepo.find({
        where: { linkPageId: page.id },
        order: { position: 'ASC' },
      });
    });
  }

  private async getOwnedLink(userId: number, linkId: number): Promise<Link> {
    const link = await this.linksRepository.findOne({
      where: { id: linkId },
      relations: { linkPage: true },
    });

    if (!link) {
      throw new NotFoundException('Ese link no existe');
    }

    if (!link.linkPage || link.linkPage.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar ese link');
    }

    return link;
  }
}