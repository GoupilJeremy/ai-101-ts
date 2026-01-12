import { AI101Error } from './configuration-error';

export class AuthenticationError extends AI101Error {
    constructor(message: string) {
        super(message, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}
