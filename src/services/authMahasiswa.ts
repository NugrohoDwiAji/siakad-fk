import api from "../api/axios";
import type { SignIn } from "../types/auth";
import { AxiosError } from "axios";

export async function signIn({ params, callback }: SignIn) {
    console.log('params', params)
  try {
    await api.get("/sanctum/csrf-cookie");
    const response = await api.post("/api/auth/mhs/login", params);
    console.log('test')
    console.log("ini response", response)
    callback({
      status: true,                                           
      data: response.data.user,
    });
  } catch (error) {       
    console.log("ini error", error)
        let errorMessage = "Terjadi kesalahan pada server.";
        
        if (error instanceof AxiosError && error.response) {
            // Ambil pesan error dari Laravel (biasanya ada di error.response.data.message)
            errorMessage = error.response.data?.message || errorMessage;
        }

        // Kirim object error yang sesuai format yang diharapkan FormSign.jsx
        callback({
            status: false,
            message: errorMessage
        });
  }
}

