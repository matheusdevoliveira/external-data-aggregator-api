import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryService } from './history.service';
import { SearchHistory } from './entities/search-history.entity';

describe('HistoryService', () => {
  let historyService: HistoryService;
  let historyRepository: jest.Mocked<Repository<SearchHistory>>;

  const mockHistoryItem = {
    id: 'history-uuid-1',
    userId: 'user-uuid-1',
    provider: 'BRAPI',
    queryParams: { ticker: 'PETR4' },
    responseStatus: 200,
    executionTimeMs: 15,
    createdAt: new Date(),
    user: {} as any,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn().mockReturnValue(mockHistoryItem),
      save: jest.fn().mockResolvedValue(mockHistoryItem),
      findAndCount: jest.fn().mockResolvedValue([[mockHistoryItem], 1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(SearchHistory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    historyService = module.get<HistoryService>(HistoryService);
    historyRepository = module.get(getRepositoryToken(SearchHistory));
  });

  it('deve estar definido', () => {
    expect(historyService).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e salvar um registro de histórico', async () => {
      const dto = {
        userId: 'user-uuid-1',
        provider: 'BRAPI',
        queryParams: { ticker: 'PETR4' },
        responseStatus: 200,
        executionTimeMs: 15,
      };

      const result = await historyService.create(dto);

      expect(historyRepository.create).toHaveBeenCalledWith(dto);
      expect(historyRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockHistoryItem);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar os dados do histórico paginados e ordenados', async () => {
      const result = await historyService.findByUserId('user-uuid-1', {
        page: 1,
        limit: 10,
      });

      expect(historyRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: [mockHistoryItem],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });
});