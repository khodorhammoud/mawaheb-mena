export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passHash?: string;
}

export interface LoggedInUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
