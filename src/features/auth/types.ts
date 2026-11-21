export interface User {
  nim: string;
  nik: string;
  npm: string;
  nisn: string;
  nomor_pendaftaran: string;
  nomor_pendaftaran_ulang: string;
    program_studi_kode: string;
   nama_mahasiswa:string,
   tempat_lahir:string,
   tanggal_lahir:string,
   alamat:string,
   kota:string,
   propinsi:string,
   telepon:string,
   jenis_kelamin:string,
   agama:string,
   golongan_darah:string,
   kewarganegaraan:string,
   nama_instansi:string,
   email:string,
   nama_ayah:string,
   agama_ayah:string,
   pekerjaan_ayah:string,
   nama_ibu:string,
   agama_ibu:string,
   pekerjaan_ibu:string,
   alamat_orangtua:string,
   kota_orangtua:string,
   propinsi_orangtua:string,
   telepon_orangtua:string,
   foto:string,
   status:string,
   status_pendaftaran:string,
   ta_lulus:string,
   created_at:string,
   updated_at:string,
   deleted_at:string
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
export interface SignInFormValues {
  nim: string;
  password: string;
}

export interface SignInFormProps {
  onSubmit: (values: SignInFormValues) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

