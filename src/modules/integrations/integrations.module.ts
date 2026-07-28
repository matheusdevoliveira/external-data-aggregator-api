import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AwesomeApiService } from './services/awesome-api.service';
import { BrapiService } from './services/brapi.service';
import { ViaCepService } from './services/viacep.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 3000,
      maxRedirects: 3,
    }),
  ],
  providers: [BrapiService, AwesomeApiService, ViaCepService],
  exports: [BrapiService, AwesomeApiService, ViaCepService],
})
export class IntegrationsModule { }