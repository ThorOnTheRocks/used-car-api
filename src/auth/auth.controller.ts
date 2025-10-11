import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { SigninDto } from './dtos/signin.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Serialize(AuthResponseDto)
  async signup(
    @Body() body: SignupDto,
  ): Promise<{ user: User; access_token: string }> {
    return this.authService.signup(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      body.email as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      body.password as string,
    );
  }

  @Post('signin')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Serialize(AuthResponseDto)
  async signin(
    @Body() body: SigninDto,
  ): Promise<{ user: User; access_token: string }> {
    return this.authService.signin(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      body.email as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      body.password as string,
    );
  }

  @Get('whoami')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('signout')
  signout() {
    return { message: 'Signed out successfully' };
  }
}
