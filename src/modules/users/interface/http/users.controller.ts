import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/create-user.usecase';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class CreateUserDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() name?: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    @Inject(USER_REPOSITORY) private readonly repo: UserRepository,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.repo.findById(id);
  }
}
