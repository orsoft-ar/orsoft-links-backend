import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { isReservedUsername } from '../common/utils/username.utils';
import { ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string; user: AuthUser }> {
    const { username, email, password } = dto;

    if (isReservedUsername(username)) {
      throw new BadRequestException('Ese nombre de usuario esta reservado');
    }

    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Ese nombre de usuario ya esta en uso');
    }

    const rounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', '10'));
    const hashedPassword = await bcrypt.hash(password, rounds);

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: AuthUser }> {
    const { email, password } = dto;

    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!user.enabled) {
      throw new ForbiddenException('El usuario esta deshabilitado');
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: User): Promise<{ access_token: string; user: AuthUser }> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      email: user.email,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        enabled: user.enabled,
      },
    };
  }
}