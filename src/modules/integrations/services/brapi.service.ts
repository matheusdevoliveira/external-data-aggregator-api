import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { StockResponseDto } from '../dto/stock-response.dto';

@Injectable()
export class BrapiService {
  constructor(private readonly httpService: HttpService) { }

  async getStock(ticker: string): Promise<StockResponseDto> {
    try {
      const url = `https://brapi.dev/api/quote/${ticker.toUpperCase()}`;
      const response = await firstValueFrom(this.httpService.get(url));

      const result = response.data?.results?.[0];
      if (!result) {
        throw new NotFoundException(`Ação '${ticker}' não encontrada`);
      }

      return {
        symbol: result.symbol,
        shortName: result.shortName || result.longName || result.symbol,
        currency: result.currency || 'BRL',
        regularMarketPrice: result.regularMarketPrice,
        regularMarketDayHigh: result.regularMarketDayHigh,
        regularMarketDayLow: result.regularMarketDayLow,
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error instanceof NotFoundException) {
        throw new NotFoundException(`Ação '${ticker}' não foi localizada na B3`);
      }
      throw error;
    }
  }
}