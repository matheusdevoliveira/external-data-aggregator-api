import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { catchError, firstValueFrom, retry, timer, timeout } from 'rxjs';
import { AddressResponseDto } from '../dto/address-response.dto';

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);

  constructor(private readonly httpService: HttpService) { }

  async getAddressByCep(cep: string): Promise<AddressResponseDto> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new BadRequestException('Formato de CEP inválido. Deve conter 8 dígitos.');
    }

    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;

    try {
      const response$ = this.httpService.get(url).pipe(
        timeout(3000),
        retry({
          count: 2,
          delay: (error, retryCount) => {
            this.logger.warn(
              `Tentativa ${retryCount} falhou ao consultar ViaCEP (${cleanCep}). Retentando em ${retryCount * 400}ms...`,
            );
            return timer(retryCount * 400);
          },
        }),
        catchError((error) => {
          this.logger.error(`Falha ao comunicar com ViaCEP: ${error.message}`);
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
          }
          throw new ServiceUnavailableException(
            'Serviço de consulta de CEP indisponível no momento.',
          );
        }),
      );

      const response = await firstValueFrom(response$);

      if (response.data?.erro) {
        throw new NotFoundException(`CEP '${cep}' não foi encontrado`);
      }

      const data = response.data;
      return {
        cep: data.cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      throw error;
    }
  }
}