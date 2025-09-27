import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { ProjectMembershipSnapshot, UserStatus } from '../domain/user.entity';
import { compare } from 'bcryptjs';

export interface LoginUserInputDto {
  email: string;
  password: string;
}

export interface LoginUserOutputDto {
  user: {
    id: string;
    email: string;
    name: string;
    status: UserStatus;
  };
  memberships: ProjectMembershipSnapshot[];
}

@Injectable()
export class LoginUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(input: LoginUserInputDto): Promise<LoginUserOutputDto> {
    const email = input.email.trim();
    const password = input.password;
    if (email.length === 0 || password.length === 0) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    let user = await this.repo.findByEmail(email);
    if (!user) {
      user = await this.repo.findByEmail(email.toLowerCase());
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const validPassword = await compare(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (user.status !== UserStatus.ACTIVO) {
      throw new UnauthorizedException('La cuenta no esta activa');
    }

    const details = await this.repo.findDetailsById(user.id);
    if (!details) {
      throw new UnauthorizedException('Usuario sin informacion disponible');
    }

    const activeMemberships = details.memberships.filter(
      (membership) => membership.active,
    );

    return {
      user: {
        id: details.user.id,
        email: details.user.email,
        name: details.user.name,
        status: details.user.status,
      },
      memberships: activeMemberships,
    };
  }
}
