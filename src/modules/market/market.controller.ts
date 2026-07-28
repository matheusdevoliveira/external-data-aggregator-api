import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';

@UseGuards(JwtAuthGuard) // Todas as consultas exigem estar logado
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) { }

  @Get('stocks/:ticker')
  async getStock(@Param('ticker') ticker: string) {
    return this.marketService.getStock(ticker);
  }

  @Get('currencies/:pair')
  async getCurrency(@Param('pair') pair: string) {
    return this.marketService.getCurrency(pair);
  }

  @Get('locations/cep/:cep')
  async getCep(@Param('cep') cep: string) {
    return this.marketService.getAddressByCep(cep);
  }
}