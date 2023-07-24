import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { changeBooking, createBooking, getBooking } from '@/controllers/booking-controller';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), createBooking)
  .put('/:bookingId', changeBooking);

export { bookingRouter };
