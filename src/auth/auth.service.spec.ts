import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeJwtService: Partial<JwtService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((email: string, password: string) =>
        Promise.resolve({
          id: 1,
          email,
          password,
          toJSON: () => ({ id: 1, email, password }),
        }),
      ),
    };

    fakeJwtService = {
      signAsync: jest.fn().mockResolvedValue('test-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const email = ' test@test.com ';
    const password = 'password123';
    it('should create a new user with a salted and hashed password', async () => {
      const { user } = await service.signup(email, password);

      expect(user.password).not.toEqual(password);

      const [hash, salt] = user.password.split('.');
      expect(hash).toBeDefined();
      expect(salt).toBeDefined();
    });

    it('should generate and return an access token', async () => {
      const { access_token } = await service.signup(email, password);

      expect(fakeJwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@test.com',
      });
      expect(access_token).toBe('test-access-token');
    });
  });
});
