import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginUserUseCase, LoginUserInputDto } from '../../application/login.usecase';
import { RegisterUserUseCase, RegisterUserInputDto } from '../../application/register-user.usecase';

class LoginDto implements LoginUserInputDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

class RegisterDto implements RegisterUserInputDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUser: LoginUserUseCase,
    private readonly registerUser: RegisterUserUseCase,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUser.execute(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto);
  }
}
