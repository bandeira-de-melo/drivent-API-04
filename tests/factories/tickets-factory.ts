import faker from '@faker-js/faker';
import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType() {
  return await prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return await prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createTicketTypeRemote() {
  return await prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return await prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export function CreateUnitTicketWithTicketType(
  status: TicketStatus,
  isRemote: boolean,
  includesHotel: boolean,
): Ticket & { TicketType: TicketType } {
  const ticketTypeId = faker.datatype.number();
  const enrollmentId = faker.datatype.number();
  return {
    id: faker.datatype.number(),
    ticketTypeId,
    enrollmentId,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: faker.datatype.number(),
      name: faker.animal.bird(),
      price: faker.datatype.number({ min: 300, max: 600 }),
      isRemote,
      includesHotel,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}
