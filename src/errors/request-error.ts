import { RequestError } from '@/protocols';

export function requestError(status: number, message?: string): RequestError {
  return {
    name: 'RequestError',
    data: null,
    status,
    statusText: 'No Result',
    message: message || 'No result for this search!',
  };
}
