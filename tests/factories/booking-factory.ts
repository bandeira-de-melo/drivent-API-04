import { Booking, Room, User } from '@prisma/client';
import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number): Promise<Booking> {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function CreateUnitUser(): User {
  return {
    id: faker.datatype.number(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function CreateUnitRoom(hotelId?: number): Room {
  return {
    id: faker.datatype.number(),
    name: faker.datatype.number().toString(),
    capacity: 3,
    hotelId: hotelId || faker.datatype.number(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function CreateUnitBooking(userId: number, roomId: number): Booking {
  return {
    id: faker.datatype.number(),
    userId,
    roomId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
