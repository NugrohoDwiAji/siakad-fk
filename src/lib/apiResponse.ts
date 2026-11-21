// 1. Definisikan tipe agar TypeScript tahu persis bentuk datanya
export type SuccessResponse<T = unknown> = {
  status: true; // HARUS literal 'true' (bukan boolean)
  kode: number;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  status: false; // HARUS literal 'false' (bukan boolean)
  kode: number;
  message: string;
  errors?: Record<string, string[]> | null;
};

// Gabungan dari keduanya
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// 2. Terapkan tipe tersebut ke fungsimu
export const successResponse = <T>(kode: number, data: T, message?: string): SuccessResponse<T> => ({
  status: true,
  kode,
  data,
  ...(message && { message }),
});

export const errorResponse = (kode: number, message: string, errors?: Record<string, string[]> | null): ErrorResponse => ({
  status: false,
  kode,
  message,
  errors: errors || null,
});