import { Booking, Room } from '@prisma/client';
import {
  CreateUnitBooking,
  CreateUnitEnrollmentWithAdress,
  CreateUnitRoom,
  CreateUnitTicketWithTicketType,
  CreateUnitUser,
} from '../factories';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { forbiddenError } from '@/errors/forbidden-error';
import { notFoundError, requestError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Booking Service unit test', () => {
  describe('GET booking test', () => {
    it('it should return the user booking', async () => {
      const mockUserBooking: Booking & { Room: Room } = {
        id: 1,
        userId: 1,
        roomId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        Room: {
          id: 1,
          name: '1001',
          capacity: 4,
          hotelId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce(mockUserBooking);
      const userBooking = await bookingService.getBooking(1);
      expect(userBooking).toEqual(mockUserBooking);
    });

    it('should shoul throw Not Found Error if user has no booking', async () => {
      jest.spyOn(bookingRepository, 'getBookingByUserId').mockResolvedValueOnce(null);
      const promise = bookingService.getBooking(1);
      expect(promise).rejects.toEqual(notFoundError());
    });
  });

  describe('POST booking test', () => {
    it('it should respond with Forbidden Error if user is not enrolled', async () => {
      const mockUser = CreateUnitUser();
      const mockRoom = CreateUnitRoom();
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce(null);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(forbiddenError('User Must Be Enrolled.'));
    });

    it('it should respond with Forbidden Error if user has no ticket', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(null);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(forbiddenError('User Must Have A Ticket.'));
    });

    it('it should respond with Payment Requided Error if ticket status is not PAID', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketNotPAID = CreateUnitTicketWithTicketType('RESERVED', false, true);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketNotPAID);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(forbiddenError('Ticket Status Must Be PAID.'));
    });

    it('it should respond with Request Error: Unprocessable Entity if ticket is Remote', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketRemote = CreateUnitTicketWithTicketType('PAID', true, true);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketRemote);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(forbiddenError('The Ticket Should Be Of The In-Person Type.'));
    });

    it('it should respond with Request Error: Unprocessable Entity if ticket does not include hotel.', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketWithoutHotel = CreateUnitTicketWithTicketType('PAID', false, false);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketWithoutHotel);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(forbiddenError('The Ticket Should A Hotel Included.'));
    });

    it('it should respond with Not Found Error if the given roomId does not exist', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketWithHotel = CreateUnitTicketWithTicketType('PAID', false, true);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketWithHotel);
      jest.spyOn(bookingRepository, 'getRoomById').mockResolvedValueOnce(null);
      const promise = bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).rejects.toEqual(notFoundError());
    });

    it('should respond with Forbidden Error if user tries to book a room that has reached its full capacity', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketWithHotel = CreateUnitTicketWithTicketType('PAID', false, true);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketWithHotel);
      jest.spyOn(bookingRepository, 'getRoomById').mockResolvedValueOnce(mockRoom);
      jest.spyOn(bookingRepository, 'countBookingsByRoomId').mockResolvedValueOnce(3);
      const promise = await bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).toEqual(forbiddenError());
    });

    it('should respond with created booking id', async () => {
      const mockUser = CreateUnitUser();
      const mockEnrollment = CreateUnitEnrollmentWithAdress(mockUser);
      const mockRoom = CreateUnitRoom();
      const mockTicketWithHotel = CreateUnitTicketWithTicketType('PAID', false, true);
      const mockBooking = CreateUnitBooking(mockUser.id, mockRoom.id);

      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollment);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicketWithHotel);
      jest.spyOn(bookingRepository, 'getRoomById').mockResolvedValueOnce(mockRoom);
      jest.spyOn(bookingRepository, 'countBookingsByRoomId').mockResolvedValueOnce(2);
      jest.spyOn(bookingRepository, 'createBooking').mockResolvedValueOnce({ id: mockBooking.id });
      const promise = await bookingService.createBooking(mockRoom.id, mockUser.id);
      expect(promise).toEqual({ id: mockBooking.id });
    });
  });
});
