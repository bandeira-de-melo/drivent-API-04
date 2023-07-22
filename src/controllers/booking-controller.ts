import { Response } from 'express';
import httpStatus from 'http-status';
import { requestError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { RoomId } = req.body;
  const userId = req.userId;

  if (!RoomId) throw requestError(400, 'The Room Id is Required.');
  try {
    const bookingId = await bookingService.createBooking(RoomId, userId);
    res.status(httpStatus.OK).send(bookingId);
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
    const booking = bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const roomId = Number(req.body.roomId);

  try {
    const booking = bookingService.updateBooking(userId, bookingId, roomId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
