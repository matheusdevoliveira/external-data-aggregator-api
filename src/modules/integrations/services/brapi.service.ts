import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { catchError, firstValueFrom, retry, timer, timeout } from 'rxjs';
import { StockResponseDto } from '../dto/stock-response.dto';

@Injectable()
export class BrapiService {
  private readonly logger = new Logger(BrapiService.name);

  constructor(private readonly httpService: HttpService) { }

  async getStock(ticker: string): Promise<StockResponseDto> {
    const url = `https://brapi.dev/api/quote/${ticker.toUpperCase()}`;

    try {
      const response$ = this.httpService.get(url).pipe(
        // 1. Aborta a tentativa se a API externa demorar mais de 3 segundos
        timeout(3000),
        // 2. Em caso de erro de rede ou timeout, tenta novamente 3 vezes com tempo incremental (Backoff)
        retry({
          count: 3,
          delay: (error, retryCount) => {
            this.logger.warn(
              `Tentativa ${retryCount} falhou ao consultar Brapi (${ticker}). Tentando novamente em ${retryCount * 500}ms...`,
            );
            return timer(retryCount * 500);
          },
        }),
        // 3. Se todas as 3 tentativas falharem, trata a falha sem derrubar o sistema
        catchError((error) => {
          this.logger.error(`Falha definitiva ao comunicar com a Brapi API: ${error.message}`);
          if (error.response?.status === 404) {
            throw new NotFoundException(`Ação '${ticker}' não foi localizada na B3`);
          }
          throw new ServiceUnavailableException(
            'Serviço de cotações temporariamente indisponível. Tente novamente em instantes.',
          );
        }),
      );

      const response = await firstValueFrom(response$);
      const result = response.data?.results?.[0];

      if (!result) {
        throw new NotFoundException(`Ação '${ticker}' não foi localizada na B3`);
      }

      return {
        symbol: result.symbol,
        shortName: result.shortName || result.longName || result.symbol,
        currency: result.currency || 'BRL',
        regularMarketPrice: result.regularMarketPrice,
        regularMarketDayHigh: result.regularMarketDayHigh,
        regularMarketDayLow: result.regularMarketDayLow,
      };
    } catch (error) {
      throw error;
    }
  }
}