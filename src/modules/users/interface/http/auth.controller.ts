import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginUserUseCase, LoginUserInputDto } from '../../application/login.usecase';
import { RegisterUserUseCase, RegisterUserInputDto } from '../../application/register-user.usecase';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';


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
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUser.execute(dto);

    const accessToken = await this.jwt.signAsync({
      sub: result.user.id,
      email: result.user.email,
    });

    return {
      accessToken,
      user: result.user,
      memberships: result.memberships,
    };
  }
}
