import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { changeBooking, createBooking, getBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', createBooking)
  .put('/:bookingId', changeBooking);

export { bookingRouter };
