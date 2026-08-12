import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../common/decorators/get-user.decorator';
import { CreateLinkPageDto } from './dto/create-link-page.dto';
import { UpdateLinkPageDto } from './dto/update-link-page.dto';
import { LinkPage } from './entities/link-page.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class LinkPagesService {
  constructor(
    @InjectRepository(LinkPage)
    private readonly linkPagesRepository: Repository<LinkPage>,
    private readonly usersService: UsersService,
  ) {}

  async getMyPage(userId: number): Promise<LinkPage> {
    const page = await this.linkPagesRepository.findOne({
      where: { userId },
      relations: { links: true },
    });

    if (!page) {
      throw new NotFoundException('Aun no tienes una pagina de links');
    }

    page.links.sort((a, b) => a.position - b.position);
    return page;
  }

  async create(user: AuthenticatedUser, dto: CreateLinkPageDto): Promise<LinkPage> {
    const existing = await this.linkPagesRepository.findOne({ where: { userId: user.id } });
    if (existing) {
      throw new ConflictException('Ya tienes una pagina de links creada');
    }

    await this.ensureUsernameAvailable(dto.username, user.id);

    const page = this.linkPagesRepository.create({
      userId: user.id,
      username: dto.username,
      title: dto.title,
      description: dto.description ?? null,
      profileImageUrl: dto.profileImageUrl ?? null,
      isPublic: dto.isPublic ?? true,
      links: [],
    });

    return this.linkPagesRepository.save(page);
  }

  async update(userId: number, dto: UpdateLinkPageDto): Promise<LinkPage> {
    const page = await this.getOwnedPage(userId);

    if (dto.username !== undefined && dto.username !== page.username) {
      await this.ensureUsernameAvailable(dto.username, userId);
      page.username = dto.username;
    }

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.description !== undefined) page.description = dto.description;
    if (dto.profileImageUrl !== undefined) page.profileImageUrl = dto.profileImageUrl;
    if (dto.isPublic !== undefined) page.isPublic = dto.isPublic;

    return this.linkPagesRepository.save(page);
  }

  async remove(userId: number): Promise<{ deleted: boolean }> {
    const page = await this.getOwnedPage(userId);
    await this.linkPagesRepository.remove(page);
    return { deleted: true };
  }

  async findOwnedPage(userId: number): Promise<LinkPage | null> {
    return this.linkPagesRepository.findOne({ where: { userId } });
  }

  private async getOwnedPage(userId: number): Promise<LinkPage> {
    const page = await this.linkPagesRepository.findOne({ where: { userId } });
    if (!page) {
      throw new NotFoundException('Aun no tienes una pagina de links');
    }
    return page;
  }

  private async ensureUsernameAvailable(username: string, excludeUserId?: number): Promise<void> {
    const taken = await this.linkPagesRepository
      .createQueryBuilder('page')
      .where('page.username = :username', { username })
      .andWhere('page.userId != :excludeUserId', { excludeUserId: excludeUserId ?? -1 })
      .getOne();
    if (taken) {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }

    await this.usersService.ensureUsernameAvailable(username, excludeUserId);
  }
}