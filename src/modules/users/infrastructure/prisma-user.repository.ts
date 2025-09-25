import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { Usuario as PrismaUsuario } from '@prisma/client'; // <- tipos del modelo real

const mapToDomain = (u: PrismaUsuario): User =>
  new User(u.id, u.email, u.nombre); // nombre -> name

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.usuario.findUnique({ where: { id } });
    return u ? mapToDomain(u) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.usuario.findUnique({ where: { email } });
    return u ? mapToDomain(u) : null;
  }

  async create(user: User): Promise<User> {
    const u = await this.prisma.usuario.create({
      data: { id: user.id, email: user.email, nombre: user.name },
    });
    return mapToDomain(u);
  }
}
