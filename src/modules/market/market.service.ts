import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { HistoryService } from '../history/history.service';
import { AwesomeApiService } from '../integrations/services/awesome-api.service';
import { BrapiService } from '../integrations/services/brapi.service';
import { ViaCepService } from '../integrations/services/viacep.service';

@Injectable()
export class MarketService {
  constructor(
    private readonly brapiService: BrapiService,
    private readonly awesomeApiService: AwesomeApiService,
    private readonly viaCepService: ViaCepService,
    private readonly cacheService: CacheService,
    private readonly historyService: HistoryService,
  ) { }

  async getStock(ticker: string, userId: string) {
    const startTime = Date.now();
    const cacheKey = `market:stocks:${ticker.toUpperCase()}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      await this.historyService.create({
        userId,
        provider: 'BRAPI',
        queryParams: { ticker: ticker.toUpperCase() },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'CACHE', data: cachedData };
    }

    try {
      const data = await this.brapiService.getStock(ticker);
      await this.cacheService.set(cacheKey, data, 300);

      await this.historyService.create({
        userId,
        provider: 'BRAPI',
        queryParams: { ticker: ticker.toUpperCase() },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'API_EXTERNAL', data };
    } catch (error: any) {
      await this.historyService.create({
        userId,
        provider: 'BRAPI',
        queryParams: { ticker: ticker.toUpperCase() },
        responseStatus: error.status || 500,
        executionTimeMs: Date.now() - startTime,
      });
      throw error;
    }
  }

  async getCurrency(pair: string, userId: string) {
    const startTime = Date.now();
    const formattedPair = pair.replace('/', '-').toUpperCase();
    const cacheKey = `market:currencies:${formattedPair}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      await this.historyService.create({
        userId,
        provider: 'AWESOME_API',
        queryParams: { pair: formattedPair },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'CACHE', data: cachedData };
    }

    try {
      const data = await this.awesomeApiService.getCurrencyPair(pair);
      await this.cacheService.set(cacheKey, data, 300);

      await this.historyService.create({
        userId,
        provider: 'AWESOME_API',
        queryParams: { pair: formattedPair },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'API_EXTERNAL', data };
    } catch (error: any) {
      await this.historyService.create({
        userId,
        provider: 'AWESOME_API',
        queryParams: { pair: formattedPair },
        responseStatus: error.status || 500,
        executionTimeMs: Date.now() - startTime,
      });
      throw error;
    }
  }

  async getAddressByCep(cep: string, userId: string) {
    const startTime = Date.now();
    const cleanCep = cep.replace(/\D/g, '');
    const cacheKey = `market:cep:${cleanCep}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      await this.historyService.create({
        userId,
        provider: 'VIACEP',
        queryParams: { cep: cleanCep },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'CACHE', data: cachedData };
    }

    try {
      const data = await this.viaCepService.getAddressByCep(cep);
      await this.cacheService.set(cacheKey, data, 86400);

      await this.historyService.create({
        userId,
        provider: 'VIACEP',
        queryParams: { cep: cleanCep },
        responseStatus: 200,
        executionTimeMs: Date.now() - startTime,
      });

      return { source: 'API_EXTERNAL', data };
    } catch (error: any) {
      await this.historyService.create({
        userId,
        provider: 'VIACEP',
        queryParams: { cep: cleanCep },
        responseStatus: error.status || 500,
        executionTimeMs: Date.now() - startTime,
      });
      throw error;
    }
  }
}