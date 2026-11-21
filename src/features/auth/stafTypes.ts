export interface StafUser {
  id: number;
  email: string;
  nama: string;
  type: string;
}

export interface StafLoginPayload {
  email: string;
  password: string;
}

export interface StafLoginResponse {
  status: boolean;
  message: string;
  data: StafUser;
}
