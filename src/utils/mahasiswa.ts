export const getSemester = (nim: string): number => {
  // ambil 2 digit awal NIM
  const tahunMasuk = 2000 + parseInt(nim.substring(0, 2));

  const sekarang = new Date();

  const tahunSekarang = sekarang.getFullYear();
  const bulan = sekarang.getMonth() + 1; // 1-12

  const selisihTahun = tahunSekarang - tahunMasuk;

  // semester dasar
  let semester = selisihTahun * 2 + 1;

  // Februari - Agustus = semester genap
  if (bulan >= 2 && bulan <= 8) {
    semester += 1;
  }

  return semester;
};