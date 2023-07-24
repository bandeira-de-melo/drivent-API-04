import { Room, TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import { notFoundError, requestError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';
import { forbiddenError } from '@/errors/forbidden-error';

async function createBooking(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError('User Must Be Enrolled.');
  const ticketWithType = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticketWithType) throw forbiddenError('User Must Have A Ticket.');

  await checkTicketRules(
    ticketWithType.status,
    ticketWithType.TicketType.isRemote,
    ticketWithType.TicketType.includesHotel,
  );

  const room = await bookingRepository.getRoomById(roomId);
  if (!room) throw notFoundError();
  const bookingsForThisRoom = await bookingRepository.countBookingsByRoomId(room.id);
  if (bookingsForThisRoom >= room.capacity) return forbiddenError();
  const bookingId = await bookingRepository.createBooking(userId, room.id);
  return bookingId;
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) throw notFoundError();
  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  await checkForUserBooking(userId);
  const room = await checkForRoomExistense(roomId);
  await checkForRoomVacancy(room);
  const updatedBookingId = await bookingRepository.updateBooking(bookingId, roomId);
  return updatedBookingId;
}

function checkTicketRules(ticketStatus: TicketStatus, isTicketRemote: boolean, includesHotel: boolean) {
  if (ticketStatus !== 'PAID') {
    throw paymentRequiredError('Ticket Status Must Be PAID.');
  }
  if (isTicketRemote) {
    throw requestError(httpStatus.UNPROCESSABLE_ENTITY, 'The Ticket Should Be Of The In-Person Type.');
  }
  if (!includesHotel) throw requestError(httpStatus.UNPROCESSABLE_ENTITY, 'The Ticket Should A Hotel Included.');
}

async function checkForUserBooking(userId: number) {
  const hasUserBooking = await bookingRepository.getBookingByUserId(userId);
  if (!hasUserBooking) throw notFoundError();
}

async function checkForRoomExistense(roomId: number) {
  const room = await bookingRepository.getRoomById(roomId);
  if (!room) throw notFoundError();
  return room;
}

async function checkForRoomVacancy(room: Room) {
  const bookingsForThisRoom = await bookingRepository.countBookingsByRoomId(room.id);
  if (bookingsForThisRoom === room.capacity) throw forbiddenError('Sorry! This room has reached its full capacity.');
}

export default {
  createBooking,
  getBooking,
  updateBooking,
};
