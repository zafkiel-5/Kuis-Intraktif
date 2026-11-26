// ===== 1. DATA SOAL =====
const bankSoal = [
  { tanya: "Tag HTML untuk membuat judul paling besar adalah…", pilihan: ["<h6>", "<h1>", "<head>", "<title>"], benar: 1 },
  { tanya: "Properti CSS untuk mengubah warna teks adalah…", pilihan: ["font-color", "text-style", "color", "background"], benar: 2 },
  { tanya: "Kata kunci JavaScript untuk membuat variabel yang nilainya bisa diubah adalah…", pilihan: ["let", "const", "fixed", "static"], benar: 0 },
  { tanya: "Tag HTML untuk menampilkan gambar adalah…", pilihan: ["<picture>", "<src>", "<img>", "<image>"], benar: 2 },
  { tanya: "Selector CSS untuk memilih elemen dengan class “kartu” adalah…", pilihan: [".kartu", "#kartu", "kartu", "*kartu"], benar: 0 },
  { tanya: "Method untuk mengambil elemen berdasarkan id di JavaScript adalah…", pilihan: ["getElementByClass()", "getElementById()", "findId()", "selectId()"], benar: 1 },
  { tanya: "Properti CSS untuk membuat sudut elemen membulat adalah…", pilihan: ["border-radius", "corner", "round-edge", "border-curve"], benar: 0 },
  { tanya: "Event JavaScript yang berjalan saat tombol diklik adalah…", pilihan: ["onpress", "onclick", "ontouch", "onhit"], benar: 1 },
  { tanya: "Tag HTML untuk membuat daftar berpoin adalah…", pilihan: ["<ol>", "<list>", "<ul>", "<li> saja"], benar: 2 },
  { tanya: "Hasil dari 5 + '5' di JavaScript adalah…", pilihan: ["10", "'55'", "Error", "NaN"], benar: 1 },
];

const WAKTU_PER_SOAL = 15; // detik
const POIN_PER_SOAL = 10;
const HURUF = ["A", "B", "C", "D"];

// ===== 2. AMBIL ELEMEN =====
const $ = (id) => document.getElementById(id);
const layar = { mulai: $("layar-mulai"), kuis: $("layar-kuis"), hasil: $("layar-hasil") };

// ===== 3. STATE =====
let soal = [];
let indeks = 0;
let skor = 0;
let jumlahBenar = 0, jumlahSalah = 0, jumlahHabis = 0;
let sisaWaktu = WAKTU_PER_SOAL;
let penghitung = null;

// ===== 4. FUNGSI BANTU =====
// Fisher–Yates: pengacakan yang adil
function acak(daftar) {
  const salinan = [...daftar];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan;
}

function tampilkan(nama) {
  Object.values(layar).forEach((el) => el.classList.remove("aktif"));
  layar[nama].classList.add("aktif");
}

// ===== 5. ALUR KUIS =====
function mulaiKuis() {
  // acak urutan soal, lalu acak pilihan tiap soal sambil menandai jawaban benar
  soal = acak(bankSoal).map((s) => {
    const teksBenar = s.pilihan[s.benar];
    const pilihanAcak = acak(s.pilihan);
    return { tanya: s.tanya, pilihan: pilihanAcak, benar: pilihanAcak.indexOf(teksBenar) };
  });
  indeks = 0; skor = 0;
  jumlahBenar = jumlahSalah = jumlahHabis = 0;
  tampilkan("kuis");
  tampilkanSoal();
}

function tampilkanSoal() {
  const s = soal[indeks];
  $("nomor").textContent = `Soal ${indeks + 1} dari ${soal.length}`;
  $("skor-live").textContent = `Skor ${skor}`;
  $("pertanyaan").textContent = s.tanya;
  $("umpan-balik").textContent = "";
  $("umpan-balik").className = "umpan-balik";
  $("btn-lanjut").hidden = true;
  $("btn-lanjut").textContent = indeks === soal.length - 1 ? "Lihat hasil" : "Soal berikutnya";

  const wadah = $("pilihan");
  wadah.innerHTML = "";
  s.pilihan.forEach((teks, i) => {
    const tombol = document.createElement("button");
    tombol.className = "opsi";
    tombol.innerHTML = `<span class="huruf">${HURUF[i]}</span><span></span>`;
    tombol.lastChild.textContent = teks; // textContent agar tag seperti <h1> tampil sebagai teks
    tombol.addEventListener("click", () => periksaJawaban(i));
    wadah.appendChild(tombol);
  });

  mulaiTimer();
}

// ===== 6. TIMER =====
function mulaiTimer() {
  clearInterval(penghitung);
  sisaWaktu = WAKTU_PER_SOAL;
  perbaruiTimer();
  penghitung = setInterval(() => {
    sisaWaktu--;
    perbaruiTimer();
    if (sisaWaktu <= 0) {
      clearInterval(penghitung);
      periksaJawaban(-1); // -1 = waktu habis
    }
  }, 1000);
}

function perbaruiTimer() {
  const bar = $("timer-bar");
  bar.style.width = `${(sisaWaktu / WAKTU_PER_SOAL) * 100}%`;
  bar.className = sisaWaktu <= 3 ? "kritis" : sisaWaktu <= 7 ? "hampir" : "";
  $("timer-teks").textContent = `${sisaWaktu} detik`;
}

// ===== 7. PEMERIKSAAN JAWABAN =====
function periksaJawaban(dipilih) {
  clearInterval(penghitung);
  const s = soal[indeks];
  const semua = document.querySelectorAll(".opsi");
  const info = $("umpan-balik");

  semua.forEach((el) => (el.disabled = true));
  semua[s.benar].classList.add("benar");

  if (dipilih === s.benar) {
    skor += POIN_PER_SOAL;
    jumlahBenar++;
    info.textContent = "Benar! +10 poin";
    info.classList.add("benar");
  } else if (dipilih === -1) {
    jumlahHabis++;
    info.textContent = "Waktu habis. Jawaban yang benar ditandai hijau.";
    info.classList.add("salah");
  } else {
    jumlahSalah++;
    semua[dipilih].classList.add("salah");
    info.textContent = "Belum tepat. Jawaban yang benar ditandai hijau.";
    info.classList.add("salah");
  }

  $("skor-live").textContent = `Skor ${skor}`;
  $("btn-lanjut").hidden = false;
  $("btn-lanjut").focus();
}

function soalBerikutnya() {
  indeks++;
  if (indeks < soal.length) tampilkanSoal();
  else tampilkanHasil();
}

// ===== 8. HASIL AKHIR =====
function tampilkanHasil() {
  const total = soal.length * POIN_PER_SOAL;
  const persen = Math.round((skor / total) * 100);

  $("skor-akhir").textContent = skor;
  $("stat-benar").textContent = jumlahBenar;
  $("stat-salah").textContent = jumlahSalah;
  $("stat-habis").textContent = jumlahHabis;
  document.querySelector(".lingkaran").style.setProperty("--persen", persen);

  let judul, pesan;
  if (persen >= 80) { judul = "Luar biasa!"; pesan = "Pemahaman dasar webmu sudah kuat."; }
  else if (persen >= 50) { judul = "Lumayan bagus"; pesan = "Tinggal sedikit lagi. Coba ulangi untuk skor lebih tinggi."; }
  else { judul = "Ayo belajar lagi"; pesan = "Pelajari ulang materi HTML, CSS, dan JavaScript, lalu coba lagi."; }
  $("judul-hasil").textContent = judul;
  $("pesan-hasil").textContent = pesan;

  tampilkan("hasil");
}

// ===== 9. EVENT =====
$("btn-mulai").addEventListener("click", mulaiKuis);
$("btn-lanjut").addEventListener("click", soalBerikutnya);
$("btn-ulang").addEventListener("click", mulaiKuis);