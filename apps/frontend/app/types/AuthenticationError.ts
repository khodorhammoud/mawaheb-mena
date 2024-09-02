export class AuthenticationError extends Error {
    status: number;
    constructor(message: string, status: number = 401) {
        super(message); // Pass message to base Error class
        this.status = status;
        this.name = 'AuthenticationError'; // Set error name as the class name
    }
}