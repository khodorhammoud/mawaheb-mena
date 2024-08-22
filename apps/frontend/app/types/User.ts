export enum EmployerAccountType {
	personal = 'personal',
	company = 'company',
}

export interface User {
	id?: number;
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	passHash?: string;
}

export interface Employer extends User {
	accountType: EmployerAccountType;
}

export interface Freelancer extends User {

}

export interface LoggedInUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
}
