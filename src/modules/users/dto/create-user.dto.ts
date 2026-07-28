import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Matheus Oliveira', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'matheus@example.com', description: 'E-mail válido para login' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha com no mínimo 6 caracteres', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}