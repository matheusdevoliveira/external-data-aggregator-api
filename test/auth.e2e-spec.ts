import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth System (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - deve rejeitar login com credenciais inválidas (HTTP 401)', () => {
    return (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'emailinvalido@domain.com',
        password: 'senhaIncorreta',
      })
      .expect(401);
  });

  it('POST /users - deve validar payload com ValidationPipe (HTTP 400 ao enviar e-mail inválido)', () => {
    return (request as any)(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Matheus',
        email: 'email-invalido-sem-@',
        password: '123',
      })
      .expect(400);
  });
});