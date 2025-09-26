// domain-model.types.ts
import { Prisma } from '@prisma/client';

export const dominioClaseArgs =
  Prisma.validator<Prisma.DominioClaseDefaultArgs>()({
    include: {
      identidades: true,
      atributos: true,
      relacionesOrigen: true,
      relacionesDestino: true,
    },
  });

export type DominioClaseWithRels = Prisma.DominioClaseGetPayload<
  typeof dominioClaseArgs
>;
