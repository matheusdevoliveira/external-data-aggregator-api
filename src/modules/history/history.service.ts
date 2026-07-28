import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHistoryDto } from './dto/create-history.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { SearchHistory } from './entities/search-history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly historyRepository: Repository<SearchHistory>,
  ) { }

  async create(dto: CreateHistoryDto): Promise<SearchHistory> {
    const history = this.historyRepository.create(dto);
    return this.historyRepository.save(history);
  }

  async findByUserId(userId: string, paginationQuery: PaginationQueryDto) {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.historyRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}