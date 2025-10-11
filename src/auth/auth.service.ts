import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return await this.jwtService.signAsync(payload);
  }

  async signup(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.userService.find(normalizedEmail);

    if (users.length) {
      throw new BadRequestException('Invalid credentials');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = hash.toString('hex') + `.${salt}`;

    const user = await this.userService.create(normalizedEmail, hashedPassword);

    const accessToken = await this.generateToken(user.id, user.email);
    return {
      user,
      access_token: accessToken,
    };
  }

  async signin(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await this.userService.find(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [storedHash, salt] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateToken(user.id, user.email);

    return {
      user,
      access_token: accessToken,
    };
  }
}
