import { Injectable } from '@nestjs/common';
import { AwesomeApiService } from '../integrations/services/awesome-api.service';
import { BrapiService } from '../integrations/services/brapi.service';
import { ViaCepService } from '../integrations/services/viacep.service';

@Injectable()
export class MarketService {
  constructor(
    private readonly brapiService: BrapiService,
    private readonly awesomeApiService: AwesomeApiService,
    private readonly viaCepService: ViaCepService,
  ) { }

  async getStock(ticker: string) {
    return this.brapiService.getStock(ticker);
  }

  async getCurrency(pair: string) {
    return this.awesomeApiService.getCurrencyPair(pair);
  }

  async getAddressByCep(cep: string) {
    return this.viaCepService.getAddressByCep(cep);
  }
}