import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async ensureUsernameAvailable(username: string, excludeId?: number): Promise<void> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (excludeId !== undefined) {
      query.andWhere('user.id != :excludeId', { excludeId });
    }

    const exists = await query.getOne();
    if (exists) {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }
  }
}