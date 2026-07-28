import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';

@ApiTags('Mercado & Integrações')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) { }

  @ApiOperation({ summary: 'Consulta cotação de uma ação da B3 (ex: PETR4, VALE3)' })
  @ApiResponse({ status: 200, description: 'Dados da ação retornados com sucesso (Cache ou API)' })
  @ApiResponse({ status: 404, description: 'Ação não encontrada na B3' })
  @ApiResponse({ status: 503, description: 'Serviço da B3 temporariamente indisponível' })
  @Get('stocks/:ticker')
  async getStock(@Param('ticker') ticker: string, @CurrentUser() user: any) {
    return this.marketService.getStock(ticker, user.id);
  }

  @ApiOperation({ summary: 'Consulta cotação de par de moedas (ex: USD-BRL, EUR-BRL)' })
  @ApiResponse({ status: 200, description: 'Cotação retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Par de moedas não encontrado' })
  @Get('currencies/:pair')
  async getCurrency(@Param('pair') pair: string, @CurrentUser() user: any) {
    return this.marketService.getCurrency(pair, user.id);
  }

  @ApiOperation({ summary: 'Consulta endereço completo pelo CEP no ViaCEP' })
  @ApiResponse({ status: 200, description: 'Endereço retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Formato de CEP inválido' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  @Get('locations/cep/:cep')
  async getCep(@Param('cep') cep: string, @CurrentUser() user: any) {
    return this.marketService.getAddressByCep(cep, user.id);
  }
}