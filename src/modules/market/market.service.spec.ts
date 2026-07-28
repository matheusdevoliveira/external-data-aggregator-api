import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../cache/cache.service';
import { HistoryService } from '../history/history.service';
import { AwesomeApiService } from '../integrations/services/awesome-api.service';
import { BrapiService } from '../integrations/services/brapi.service';
import { ViaCepService } from '../integrations/services/viacep.service';
import { MarketService } from './market.service';

describe('MarketService', () => {
  let marketService: MarketService;
  let cacheService: jest.Mocked<CacheService>;
  let brapiService: jest.Mocked<BrapiService>;
  let historyService: jest.Mocked<HistoryService>;

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const mockBrapiService = {
      getStock: jest.fn(),
    };

    const mockAwesomeApiService = {
      getCurrencyPair: jest.fn(),
    };

    const mockViaCepService = {
      getAddressByCep: jest.fn(),
    };

    const mockHistoryService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: BrapiService, useValue: mockBrapiService },
        { provide: AwesomeApiService, useValue: mockAwesomeApiService },
        { provide: ViaCepService, useValue: mockViaCepService },
        { provide: HistoryService, useValue: mockHistoryService },
      ],
    }).compile();

    marketService = module.get<MarketService>(MarketService);
    cacheService = module.get(CacheService);
    brapiService = module.get(BrapiService);
    historyService = module.get(HistoryService);
  });

  it('deve retornar dados do CACHE se a chave existir no Redis', async () => {
    const mockStockData = {
      symbol: 'PETR4',
      shortName: 'PETR4',
      currency: 'BRL',
      regularMarketPrice: 40.0,
      regularMarketDayHigh: 41.0,
      regularMarketDayLow: 39.5,
    };

    cacheService.get.mockResolvedValue(mockStockData);

    const result = await marketService.getStock('PETR4', 'user-123');

    expect(result).toEqual({
      source: 'CACHE',
      data: mockStockData,
    });
    expect(cacheService.get).toHaveBeenCalledWith('market:stocks:PETR4');
    expect(brapiService.getStock).not.toHaveBeenCalled();
    expect(historyService.create).toHaveBeenCalled();
  });

  it('deve consultar a API externa (BRAPI) se não houver no cache e gravar no Redis', async () => {
    const mockStockData = {
      symbol: 'PETR4',
      shortName: 'PETR4',
      currency: 'BRL',
      regularMarketPrice: 40.0,
      regularMarketDayHigh: 41.0,
      regularMarketDayLow: 39.5,
    };

    cacheService.get.mockResolvedValue(null);
    brapiService.getStock.mockResolvedValue(mockStockData);

    const result = await marketService.getStock('PETR4', 'user-123');

    expect(result).toEqual({
      source: 'API_EXTERNAL',
      data: mockStockData,
    });
    expect(brapiService.getStock).toHaveBeenCalledWith('PETR4');
    expect(cacheService.set).toHaveBeenCalledWith('market:stocks:PETR4', mockStockData, 300);
    expect(historyService.create).toHaveBeenCalled();
  });
});