import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { catchError, firstValueFrom, retry, timer, timeout } from 'rxjs';
import { CurrencyResponseDto } from '../dto/currency-response.dto';

@Injectable()
export class AwesomeApiService {
  private readonly logger = new Logger(AwesomeApiService.name);

  constructor(private readonly httpService: HttpService) { }

  async getCurrencyPair(pair: string): Promise<CurrencyResponseDto> {
    const formattedPair = pair.replace('/', '-').toUpperCase();
    const url = `https://economia.awesomeapi.com.br/last/${formattedPair}`;

    try {
      const response$ = this.httpService.get(url).pipe(
        timeout(3000),
        retry({
          count: 3,
          delay: (error, retryCount) => {
            this.logger.warn(
              `Tentativa ${retryCount} falhou ao consultar AwesomeAPI (${formattedPair}). Retentando em ${retryCount * 500}ms...`,
            );
            return timer(retryCount * 500);
          },
        }),
        catchError((error) => {
          this.logger.error(`Falha ao comunicar com AwesomeAPI: ${error.message}`);
          if (error.response?.status === 404) {
            throw new NotFoundException(`Par de moedas '${pair}' não encontrado`);
          }
          throw new ServiceUnavailableException(
            'Serviço de cotações de moedas indisponível no momento.',
          );
        }),
      );

      const response = await firstValueFrom(response$);
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
    } catch (error) {
      throw error;
    }
  }
}