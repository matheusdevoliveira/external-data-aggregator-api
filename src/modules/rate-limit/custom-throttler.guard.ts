import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Se o usuário estiver autenticado (JWT), limita pelo ID do usuário.
    // Se for requisição anônima, limita pelo endereço IP.
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    return req.ip || req.headers['x-forwarded-for'] || 'anonymous';
  }
}