import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CurrencyResponseDto } from '../dto/currency-response.dto';

@Injectable()
export class AwesomeApiService {
  constructor(private readonly httpService: HttpService) { }

  async getCurrencyPair(pair: string): Promise<CurrencyResponseDto> {
    try {
      // Exemplo de par: USD-BRL ou EUR-BRL
      const formattedPair = pair.replace('/', '-').toUpperCase();
      const url = `https://economia.awesomeapi.com.br/last/${formattedPair}`;
      const response = await firstValueFrom(this.httpService.get(url));

      const key = formattedPair.replace('-', '');
      const result = response.data?.[key];

      if (!result) {
        throw new NotFoundException(`Par de moedas '${pair}' não encontrado`);
      }

      return {
        code: result.code,
        codein: result.codein,
        name: result.name,
        bid: parseFloat(result.bid),
        ask: parseFloat(result.ask),
        high: parseFloat(result.high),
        low: parseFloat(result.low),
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error instanceof NotFoundException) {
        throw new NotFoundException(`Par de moedas '${pair}' não encontrado`);
      }
      throw error;
    }
  }
}