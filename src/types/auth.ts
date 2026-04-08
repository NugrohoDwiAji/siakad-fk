export interface User {
  nim: string;
  nama_pengguna: string;
  email: string;
  type: string;
}

interface Params {
  nim: string;
  password: string;
}

interface CallbackResponse {
  status: boolean;
  message?: string;
  data?: User;
}
export interface SignIn {
  params: Params;
  callback: (response: CallbackResponse) => void;
}

