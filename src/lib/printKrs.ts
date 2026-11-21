import type { Mahasiswa, KrsEntry, MataKuliahKrs } from "../features/mahasiswa";

export function printKrs(mahasiswa: Mahasiswa, krs: KrsEntry) {
  const mataKuliah: MataKuliahKrs[] = krs.mataKuliah || [];

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Gagal membuka jendela cetak. Pastikan pop-up blocker dimatikan.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cetak KRS - ${mahasiswa.nim}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          margin: 0;
          padding: 20px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 3px solid #000;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          text-transform: uppercase;
        }
        .header h2 {
          margin: 5px 0 0;
          font-size: 18px;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 14px;
        }
        .title {
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          margin: 20px 0;
          text-decoration: underline;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-table td {
          padding: 6px 0;
          vertical-align: top;
          font-size: 14px;
        }
        .info-table td.label {
          width: 130px;
          font-weight: bold;
        }
        .info-table td.colon {
          width: 15px;
          text-align: center;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin: 15px 0 8px;
          text-transform: uppercase;
          text-decoration: underline;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
          margin-bottom: 20px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 14px;
        }
        table.data-table th {
          background-color: #f0f0f0;
          text-align: center;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .text-center {
          text-align: center;
        }
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }
        .signature {
          width: 250px;
          text-align: center;
        }
        .signature p {
          margin: 0 0 70px;
          font-size: 14px;
        }
        .signature .name {
          font-weight: bold;
          text-decoration: underline;
        }
        @media print {
          body {
            padding: 0;
          }
          @page {
            margin: 1.5cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>UNIVERSITAS BINA BANGSA GETSEMPENA</h1>
        <h2>FAKULTAS KEDOKTERAN</h2>
        <p>Jl. Tanggul Krueng Aceh, Rukoh, Kec. Syiah Kuala, Kota Banda Aceh, Aceh</p>
      </div>

      <div class="title">KARTU RENCANA STUDI (KRS)</div>

      <div class="info-section">
        <table class="info-table">
          <tr>
            <td class="label">NIM</td>
            <td class="colon">:</td>
            <td width="40%">${mahasiswa.nim}</td>
            <td class="label">Tahun Ajaran</td>
            <td class="colon">:</td>
            <td>${krs.tahunAjaran}</td>
          </tr>
          <tr>
            <td class="label">Nama Mahasiswa</td>
            <td class="colon">:</td>
            <td>${mahasiswa.nama}</td>
            <td class="label">Semester</td>
            <td class="colon">:</td>
            <td>${krs.semester}</td>
          </tr>
          <tr>
            <td class="label">Program Studi</td>
            <td class="colon">:</td>
            <td>${mahasiswa.programStudi}</td>
            <td class="label">Dosen Wali</td>
            <td class="colon">:</td>
            <td>${mahasiswa.dosenWali && mahasiswa.dosenWali !== "-" ? mahasiswa.dosenWali : "Belum Ditentukan"}</td>
          </tr>
        </table>
      </div>

      <div class="section-title">Data Orang Tua / Wali</div>
      <div class="info-section">
        <table class="info-table">
          <tr>
            <td class="label">Nama Ayah</td>
            <td class="colon">:</td>
            <td width="40%">${mahasiswa.orangTua.namaAyah}</td>
            <td class="label">No. Telp Ayah</td>
            <td class="colon">:</td>
            <td>${mahasiswa.orangTua.nohpAyah}</td>
          </tr>
          <tr>
            <td class="label">Nama Ibu</td>
            <td class="colon">:</td>
            <td>${mahasiswa.orangTua.namaIbu}</td>
            <td class="label">No. Telp Ibu</td>
            <td class="colon">:</td>
            <td>${mahasiswa.orangTua.nohpIbu}</td>
          </tr>
        </table>
      </div>

      <div class="section-title">Daftar Mata Kuliah</div>
      <table class="data-table">
        <thead>
          <tr>
            <th width="5%">No</th>
            <th width="15%">Kode MK</th>
            <th width="50%">Nama Mata Kuliah</th>
            <th width="15%">SKS Teori</th>
            <th width="15%">SKS Praktek</th>
          </tr>
        </thead>
        <tbody>
          ${mataKuliah.map((mk, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-center">${mk.kodeMatakuliah}</td>
              <td>${mk.namaMatakuliah}</td>
              <td class="text-center">${mk.sksTeori}</td>
              <td class="text-center">${mk.sksPraktik}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="3" style="text-align: right; padding-right: 15px;">Total SKS:</th>
            <th colspan="2" class="text-center">${krs.totalSks} SKS</th>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        <div class="signature">
          <p>Banda Aceh, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br>Mengesahkan,<br>Dosen Wali</p>
          <div class="name">${mahasiswa.dosenWali && mahasiswa.dosenWali !== "-" ? mahasiswa.dosenWali : "(..........................................)"}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Tunggu sejenak agar DOM dirender dengan sempurna sebelum memanggil print()
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}
