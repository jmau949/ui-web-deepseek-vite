export interface User {
  sub?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any; // Allows additional properties from Cognito's response
}

export interface LoginCredentials {
  email: string;
  password: string;
}
