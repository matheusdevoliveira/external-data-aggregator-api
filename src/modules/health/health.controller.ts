import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
  ) { }

  @ApiOperation({ summary: 'Verifica a saúde da API e das suas conexões (PostgreSQL e APIs externas)' })
  @ApiResponse({ status: 200, description: 'Todos os serviços estão operacionais' })
  @ApiResponse({ status: 503, description: 'Um ou mais serviços de infraestrutura falharam' })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 1. Verifica a conexão com o PostgreSQL
      () => this.db.pingCheck('database'),
      // 2. Verifica a conectividade externa com a API da Brapi
      () => this.http.pingCheck('brapi_api', 'https://brapi.dev/api/quote/PETR4'),
    ]);
  }
}