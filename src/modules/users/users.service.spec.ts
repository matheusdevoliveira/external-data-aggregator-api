import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-uuid-1',
    name: 'Matheus Oliveira',
    email: 'matheus@example.com',
    passwordHash: '$2b$10$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: 'user-uuid-1',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })),
      save: jest.fn().mockImplementation((user) => Promise.resolve({
        id: user.id || 'user-uuid-1',
        name: user.name,
        email: user.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('deve estar definido', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário se o e-mail não estiver em uso', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await usersService.create({
        name: 'Matheus Oliveira',
        email: 'matheus@example.com',
        password: 'senhaSegura123',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'matheus@example.com' },
      });
      expect(result).toHaveProperty('id');
      expect(result.email).toBe('matheus@example.com');
    });

    it('deve lançar ConflictException se o e-mail já estiver cadastrado', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        usersService.create({
          name: 'Matheus Oliveira',
          email: 'matheus@example.com',
          password: 'senhaSegura123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário ao buscar por e-mail', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('matheus@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'matheus@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});