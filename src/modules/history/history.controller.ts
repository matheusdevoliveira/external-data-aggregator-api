import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { HistoryService } from './history.service';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) { }

  @Get()
  async getMyHistory(
    @CurrentUser() user: any,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.historyService.findByUserId(user.id, paginationQuery);
  }
}