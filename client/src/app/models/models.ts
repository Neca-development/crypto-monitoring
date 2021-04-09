export interface User {
  id: number;
  login: string;
  password: string;
}

export interface IAuthorizedUser {
  id: number;
  role: string;
  token: string;
}

export interface UserInfo {
  userId: number;
  name: string;
  surname: string;
  middleName: string;
  coins: string;
}

export interface Abonements {
  userId: number;
  startDate: string;
  endDate: string;
}

export interface Lesson {
  userId: number;
  visited: [index: number];
  missing: [index: number];
  comming: [index: number];
}

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface CalendarDatesList {
  [index: number]: CalendarDate;
}

export interface IAPIResponse<T> {
  data?: T;
  errorMessage?: string;
  status: any;
}
