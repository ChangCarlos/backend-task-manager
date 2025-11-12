export interface UserCreate {
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserLogin {
  email: string;
  password: string;
  token: string;
}
