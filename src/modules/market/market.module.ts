import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/history.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [IntegrationsModule, HistoryModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule { }