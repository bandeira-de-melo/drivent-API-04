import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const { roomId } = req.body;

  if (!roomId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const bookingId = await bookingService.createBooking(roomId, userId);
    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    if (error.name === 'PaymentRequiredError') {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND);
    if (error.name === 'ForbiddenError') {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
  }
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;

  try {
    const booking = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    console.log(error);
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const roomId = Number(req.body.roomId);
  if (!bookingId || !roomId) return res.sendStatus(httpStatus.FORBIDDEN);

  try {
    const booking = await bookingService.updateBooking(userId, bookingId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
