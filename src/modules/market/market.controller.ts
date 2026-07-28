import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';

@UseGuards(JwtAuthGuard)
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) { }

  @Get('stocks/:ticker')
  async getStock(@Param('ticker') ticker: string, @CurrentUser() user: any) {
    return this.marketService.getStock(ticker, user.id);
  }

  @Get('currencies/:pair')
  async getCurrency(@Param('pair') pair: string, @CurrentUser() user: any) {
    return this.marketService.getCurrency(pair, user.id);
  }

  @Get('locations/cep/:cep')
  async getCep(@Param('cep') cep: string, @CurrentUser() user: any) {
    return this.marketService.getAddressByCep(cep, user.id);
  }
}