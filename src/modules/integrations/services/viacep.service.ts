import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AddressResponseDto } from '../dto/address-response.dto';

@Injectable()
export class ViaCepService {
  constructor(private readonly httpService: HttpService) { }

  async getAddressByCep(cep: string): Promise<AddressResponseDto> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new BadRequestException('Formato de CEP inválido. Deve conter 8 dígitos.');
    }

    try {
      const url = `https://viacep.com.br/ws/${cleanCep}/json/`;
      const response = await firstValueFrom(this.httpService.get(url));

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
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException(`Erro ao consultar o CEP '${cep}'`);
    }
  }
}