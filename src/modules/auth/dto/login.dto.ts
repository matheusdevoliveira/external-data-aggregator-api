import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'matheus@example.com', description: 'E-mail do usuário' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha cadastrada' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}