import { ApplicationError } from '@/protocols';

export function paymentRequiredError(message?: string): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message,
  };
}
