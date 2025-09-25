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

  async execute(input: { email: string; name?: string }) {
    const exists = await this.repo.findByEmail(input.email);
    if (exists) throw new BadRequestException('Email ya registrado');
    const name = this.resolveName(input.email, input.name);
    const user = new User(randomUUID(), input.email, name);
    return this.repo.create(user);
  }

  private resolveName(email: string, name?: string) {
    const trimmed = name?.trim();
    if (trimmed && trimmed.length > 0) return trimmed;
    const [localPart] = email.split('@');
    return localPart ?? email;
  }
}
