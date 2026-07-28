import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('search_histories')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 50 })
  provider!: string; // Ex: 'BRAPI', 'AWESOME_API', 'VIACEP'

  @Column({ type: 'jsonb', name: 'query_params' })
  queryParams!: Record<string, any>; // Ex: { "ticker": "PETR4" }

  @Column({ type: 'int', name: 'response_status' })
  responseStatus!: number; // Ex: 200, 404, 503

  @Column({ type: 'int', name: 'execution_time_ms' })
  executionTimeMs!: number; // Tempo gasto em milissegundos

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}