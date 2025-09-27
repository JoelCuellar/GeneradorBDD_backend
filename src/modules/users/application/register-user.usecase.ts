import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { hash } from 'bcryptjs';
import {
  CreateAuthUserInput,
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { LoginUserOutputDto } from './login.usecase';
import { UserStatus } from '../domain/user.entity';
import { SetUserPasswordInput } from '../domain/user.repository';
export interface RegisterUserInputDto {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: RegisterUserInputDto): Promise<LoginUserOutputDto> {
    const email = input.email.trim().toLowerCase();
    const name = this.normalizeName(input.name, email);
    const password = input.password;

    if (email.length === 0) {
      throw new BadRequestException('El correo es obligatorio');
    }
    if (password.length < 8) {
      throw new BadRequestException(
        'La contrasena debe tener al menos 8 caracteres'
      );
    }

    const existing = await this.repo.findByEmail(email);
    const passwordHash = await hash(password, 10);

    if (existing) {
      if (existing.passwordHash) {
        throw new ConflictException('El correo ya esta registrado');
      }
      if (existing.status !== UserStatus.ACTIVO) {
        throw new BadRequestException('La cuenta no esta activa');
      }

      const updateInput: SetUserPasswordInput = {
        userId: existing.id,
        passwordHash,
      };
      if (name && name !== existing.name) {
        updateInput.name = name;
      }

      const updated = await this.repo.setUserPassword(updateInput);
      const details = await this.repo.findDetailsById(updated.id);
      const memberships = details?.memberships.filter((membership) => membership.active) ?? [];

      return {
        user: {
          id: updated.id,
          email: updated.email,
          name: details?.user.name ?? updated.name,
          status: updated.status,
        },
        memberships,
      };
    }

    const payload: CreateAuthUserInput = {
      id: randomUUID(),
      email,
      name,
      passwordHash,
    };

    const created = await this.repo.createAuthUser(payload);

    const details = await this.repo.findDetailsById(created.id);
    const memberships =
      details?.memberships.filter((membership) => membership.active) ?? [];

    return {
      user: {
        id: created.id,
        email: created.email,
        name: details?.user.name ?? created.name,
        status: created.status,
      },
      memberships,
    };
  }

  private normalizeName(name: string, email: string): string {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
    const [localPart] = email.split('@');
    return localPart ?? email;
  }
}
