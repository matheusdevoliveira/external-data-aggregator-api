import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [IntegrationsModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule { }