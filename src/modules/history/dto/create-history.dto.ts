export class CreateHistoryDto {
  userId!: string;
  provider!: string;
  queryParams!: Record<string, any>;
  responseStatus!: number;
  executionTimeMs!: number;
}