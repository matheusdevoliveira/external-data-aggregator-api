import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { HistoryService } from './history.service';

@ApiTags('Histórico & Auditoria')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @ApiOperation({ summary: 'Lista o histórico de pesquisas do usuário logado de forma paginada' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso com metadados de paginação' })
  @Get()
  async getMyHistory(
    @CurrentUser() user: any,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.historyService.findByUserId(user.id, paginationQuery);
  }
}