import { Room } from '@prisma/client';
import { prisma } from '@/config';

async function getRoomById(roomId: number): Promise<Room> {
  return await prisma.room.findFirst({ where: { id: roomId } });
}

async function countBookingsByRoomId(roomId: number) {
  return await prisma.booking.count({ where: { roomId } });
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({ data: { userId, roomId }, select: { id: true } });
}

async function updateBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({ where: { id: bookingId }, data: { roomId }, select: { id: true } });
}

async function getBookingByUserId(userId: number) {
  const result = await prisma.booking.findFirst({ where: { userId }, include: { Room: true } });
  return result;
}

const bookingRepository = {
  getRoomById,
  countBookingsByRoomId,
  createBooking,
  getBookingByUserId,
  updateBooking,
};

export default bookingRepository;
