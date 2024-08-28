export enum EmployerAccountType {
  personal = "personal",
  company = "company",
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passHash?: string;
  isVerified?: boolean;
}

export interface UserAccount {
  userId: number;
  accountType: EmployerAccountType;
  isOnboarded: boolean;
}

export interface Employer extends User {
  employerAccountType: EmployerAccountType;
}

export interface Freelancer extends User { }

export interface LoggedInUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
