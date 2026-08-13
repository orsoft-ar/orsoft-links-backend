import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkPage } from '../link-pages/entities/link-page.entity';
import { normalizeUsername } from '../common/utils/username.utils';

export interface PublicLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  position: number;
}

export interface PublicLinkPage {
  username: string;
  title: string;
  description: string | null;
  profileImageUrl: string | null;
  links: PublicLink[];
}

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(LinkPage)
    private readonly linkPagesRepository: Repository<LinkPage>,
  ) {}

  async getPublicPage(username: string): Promise<PublicLinkPage> {
    const normalizedUsername = normalizeUsername(username);

    const page = await this.linkPagesRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.links', 'link')
      .where('page.username = :username', { username: normalizedUsername })
      .andWhere('page.isPublic = :isPublic', { isPublic: true })
      .andWhere('link.active = :active', { active: true })
      .orderBy('link.position', 'ASC')
      .getOne();

    if (!page) {
      throw new NotFoundException('La pagina no existe o no es publica');
    }

    return {
      username: page.username,
      title: page.title,
      description: page.description,
      profileImageUrl: page.profileImageUrl,
      links: (page.links ?? []).map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon,
        position: link.position,
      })),
    };
  }

  async getSitemapPages(): Promise<
    Array<{ username: string; updatedAt: Date }>
  > {
    const pages = await this.linkPagesRepository
      .createQueryBuilder('page')
      .select('page.username', 'username')
      .addSelect('page.updatedAt', 'updatedAt')
      .where('page.isPublic = :isPublic', { isPublic: true })
      .orderBy('page.updatedAt', 'DESC')
      .getRawMany();

    return pages.map((page) => ({
      username: page.username,
      updatedAt: page.updatedAt,
    }));
  }
}