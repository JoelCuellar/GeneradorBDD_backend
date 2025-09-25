import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: { email: string; name: string }) {
    const exists = await this.repo.findByEmail(input.email);
    if (exists) throw new BadRequestException('Email ya registrado');
    const user = new User(randomUUID(), input.email, input.name);
    return this.repo.create(user);
  }
}
