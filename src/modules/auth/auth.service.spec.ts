import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-uuid-123',
    name: 'Matheus Oliveira',
    email: 'matheus@example.com',
    passwordHash: '$2b$10$hashedpasswordvalue',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'super-secret-key';
        if (key === 'JWT_EXPIRATION') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'super-refresh-secret-key';
        if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('deve estar definido', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('deve autenticar o usuário e retornar os tokens se as credenciais forem válidas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jwtService.signAsync.mockResolvedValueOnce('fake-access-token');
      jwtService.signAsync.mockResolvedValueOnce('fake-refresh-token');

      const result = await authService.login({
        email: 'matheus@example.com',
        password: 'senhaSegura123',
      });

      expect(result).toEqual({
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('matheus@example.com');
    });

    it('deve lançar UnauthorizedException se o e-mail não existir', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'naoexistente@example.com',
          password: 'senhaSegura123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha for incorreta', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        authService.login({
          email: 'matheus@example.com',
          password: 'senhaIncorreta',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});