import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
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
  ) { }

  async getStock(ticker: string) {
    const cacheKey = `market:stocks:${ticker.toUpperCase()}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      return {
        source: 'CACHE',
        data: cachedData,
      };
    }

    const data = await this.brapiService.getStock(ticker);

    // TTL de 5 minutos (300 segundos) para cotações de ações
    await this.cacheService.set(cacheKey, data, 300);

    return {
      source: 'API_EXTERNAL',
      data,
    };
  }

  async getCurrency(pair: string) {
    const formattedPair = pair.replace('/', '-').toUpperCase();
    const cacheKey = `market:currencies:${formattedPair}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      return {
        source: 'CACHE',
        data: cachedData,
      };
    }

    const data = await this.awesomeApiService.getCurrencyPair(pair);

    // TTL de 5 minutos (300 segundos) para cotações de moedas
    await this.cacheService.set(cacheKey, data, 300);

    return {
      source: 'API_EXTERNAL',
      data,
    };
  }

  async getAddressByCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    const cacheKey = `market:cep:${cleanCep}`;
    const cachedData = await this.cacheService.get(cacheKey);

    if (cachedData) {
      return {
        source: 'CACHE',
        data: cachedData,
      };
    }

    const data = await this.viaCepService.getAddressByCep(cep);

    // TTL de 24 horas (86400 segundos) para endereços/CEP
    await this.cacheService.set(cacheKey, data, 86400);

    return {
      source: 'API_EXTERNAL',
      data,
    };
  }
}