/* ===== Fitur Mahasiswa: data (localStorage), sesi, riwayat, notifikasi, password ===== */
const KEY = 'pinjamalat_mhs_v1', ALAT = [], R = {};
let S;
const AKTIF = ['Menunggu Review','Pengecekan Barang','Siap Diambil','Dipinjam','Terlambat'];
const MENU = {
  guest: [['beranda','Beranda'],['katalog','Katalog &amp; Simulasi'],['login','Masuk']],
  mahasiswa: [['beranda','Beranda'],['katalog','Katalog'],['pengajuan','Ajukan'],['riwayat','Riwayat'],['notifikasi','Notifikasi'],['password','Ubah Password']]
};
const AWAL = {mahasiswa:'katalog'};
const AKSES = {pengajuan:['mahasiswa'], riwayat:['mahasiswa'], notifikasi:['mahasiswa'], password:['mahasiswa']};

const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now = () => new Date().toLocaleString('id-ID');
const me = () => S.users.find(x => x.u === sessionStorage.pa);
const peran = () => (me() || {}).role || 'guest';
const namaAlat = k => (S.alat.find(a => a.kode === k) || {nama:k}).nama;
const $c = () => $('#content');
const pesan = (sel, t, ok) => $(sel).attr('class', 'msg ' + (ok ? 'ok' : 'no')).text(t);
const head = (t, s) => `<h2>${t}</h2><p class="sub">${s}</p>`;
const tbl = (h, r) => `<div style="overflow-x:auto"><table class="tb"><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${r.length ? r.join('') : `<tr><td colspan="${h.length}">Belum ada data.</td></tr>`}</tbody></table></div>`;

function awal(){
  const al = (kode, nama, stok, maks, img) => ({kode, nama, stok, total:stok, maks, img});
  const t = n => tambahHari(hariIni(), n), nim = '25091397055', nama = 'Prahma Agis Shevina';
  const pj = (id, alat, jumlah, a, b, status, matkul, kep, catatan) => ({id, nim, nama, alat, jumlah, tglPinjam:t(a), tglKembali:t(b),
    kelas:'B', prodi:'Manajemen Informatika', matkul, dosen:'Ari Kurniawan', keperluan:kep, status, catatan:catatan || ''});
  return {
    users:[{u:nim, n:nama, pw:'mhs123', role:'mahasiswa', gagal:0, kunci:0}],
    alat:[al('PP-001','Kabel HDMI',8,3,'hdmi'), al('PP-002','Proyektor',3,1,'proyektor'), al('PP-003','Kabel LAN',13,3,'lan'),
          al('PP-004','HDD Eksternal',5,3,'hdd'), al('PP-005','Stopkontak (Terminal Listrik)',10,3,'stopkontak')],
    alatAsli:null,
    pj:[pj(1,'PP-001',1,-10,-8,'Dikembalikan','Pemrograman Web','Presentasi tugas kelompok'),
        pj(2,'PP-002',1,-6,-6,'Ditolak','Basis Data','Presentasi kelompok di ruang kelas','Proyektor dipakai kegiatan prodi pada tanggal tersebut.'),
        pj(3,'PP-003',2,-1,2,'Dipinjam','Jaringan Komputer','Praktikum jaringan kabel LAN'),
        pj(4,'PP-004',1,1,3,'Siap Diambil','Pemrograman Web','Memindahkan data proyek praktikum'),
        pj(5,'PP-001',1,2,4,'Menunggu Review','Pemrograman Web','Menampilkan hasil UTS ke proyektor')],
    notif:[{u:nim, pesan:'Pengajuan #4 (HDD Eksternal): Siap Diambil. Ambil alat di lab.', waktu:now(), baca:false},
           {u:nim, pesan:'Pengajuan #2 (Proyektor): Ditolak', waktu:now(), baca:true}],
    cfg:{maksAktif:5, minPw:6, gagal:5, timeout:30}
  };
}
function save(){ localStorage[KEY] = JSON.stringify(S); ALAT.length = 0; ALAT.push(...S.alat); }
function notif(u, t){ S.notif.push({u, pesan:t, waktu:now(), baca:false}); }

function init(){
  try { S = JSON.parse(localStorage[KEY]); } catch(x) {}
  if(!S || !S.users) S = awal();
  S.pj.forEach(p => { if(p.status === 'Dipinjam' && p.tglKembali < hariIni()) p.status = 'Terlambat'; });   // FR-16
  save(); buildNav();
  let tm; const reset = () => { clearTimeout(tm); if(me()) tm = setTimeout(() => keluar(true), S.cfg.timeout * 60000); };
  $(document).on('click keydown', reset).on('click', '#keluar', ev => { ev.preventDefault(); keluar(); }); reset();
}
function keluar(auto){
  sessionStorage.removeItem('pa'); buildNav(); muat('login');
  if(auto) alert('Sesi berakhir karena tidak ada aktivitas. Silakan masuk lagi.');
}
function buildNav(){
  const u = me(), cur = location.hash.slice(1), nb = u ? S.notif.filter(n => n.u === u.u && !n.baca).length : 0;
  let h = MENU[peran()].map(([p, t]) => `<a href="#${p}" data-page="${p}" class="${p === cur ? 'aktif' : ''}">${t}${p === 'notifikasi' && nb ? ` (${nb})` : ''}</a>`).join('');
  if(u) h += '<a href="#" id="keluar">Keluar</a>';
  $('#nav').html(h);
}

/* ----- Transaksi pengajuan (dipanggil dari form 2.c) ----- */
function cekBatas(d){
  const n = S.pj.filter(p => p.nim === d.nim && AKTIF.includes(p.status)).length;
  return n >= S.cfg.maksAktif ? `Batas pinjam aktif ${S.cfg.maksAktif} pengajuan sudah tercapai.` : '';
}
function tambahPj(d){
  const id = Math.max(0, ...S.pj.map(p => p.id)) + 1;
  S.pj.push({...d, id, jumlah:+d.jumlah, status:'Menunggu Review', catatan:''});
  notif(d.nim, `Pengajuan #${id} (${namaAlat(d.alat)}) terkirim. Status: Menunggu Review`); save(); buildNav(); return id;
}

/* ----- Login (FR-01, NFR-03) ----- */
R.login = () => {
  $c().html(head('Masuk', 'Gunakan NIM sebagai username dan password akunmu.') +
  `<form id="fLogin" class="card f" style="max-width:420px" novalidate>
   <label for="lu">Username (NIM)</label><input id="lu" autocomplete="username" inputmode="numeric">
   <label for="lp">Password</label><input id="lp" type="password" autocomplete="current-password">
   <p class="hint">Akun terkunci ${S.cfg.gagal}x gagal login, lalu terbuka otomatis setelah 5 menit.</p>
   <p><button class="btn" type="submit">Masuk</button></p><div id="lm" role="status"></div></form>
   <p class="hint">Akun demo: 25091397055 / mhs123</p>`);
  $('#fLogin').on('submit', ev => {
    ev.preventDefault();
    const u = $('#lu').val().trim(), p = $('#lp').val(), x = S.users.find(a => a.u === u);
    if(!u || !p) return pesan('#lm', 'Username dan password wajib diisi.', 0);
    if(!x) return pesan('#lm', 'Username atau password salah.', 0);
    if(x.kunci > Date.now()) return pesan('#lm', `Akun terkunci. Coba lagi dalam ${Math.ceil((x.kunci - Date.now()) / 60000)} menit.`, 0);
    if(x.pw !== p){
      x.gagal++;
      if(x.gagal >= S.cfg.gagal){ x.kunci = Date.now() + 5 * 60000; x.gagal = 0; save(); return pesan('#lm', 'Akun terkunci selama 5 menit karena terlalu banyak gagal login.', 0); }
      save(); return pesan('#lm', `Username atau password salah (${x.gagal}/${S.cfg.gagal}).`, 0);
    }
    x.gagal = 0; sessionStorage.pa = x.u; save(); buildNav(); muat(AWAL[x.role]);
  });
};

/* ----- Riwayat + batalkan (FR-07, FR-08) ----- */
R.riwayat = () => {
  const d = S.pj.filter(p => p.nim === me().u).reverse();
  $c().html(head('Riwayat peminjaman', 'Pengajuan hanya bisa dibatalkan saat status Menunggu Review.') +
    tbl(['#','Alat','Jumlah','Tanggal','Status','Aksi'], d.map(p => `<tr><td>${p.id}</td><td>${e(namaAlat(p.alat))}</td><td>${p.jumlah}</td><td>${p.tglPinjam} s/d ${p.tglKembali}</td>
      <td><b>${p.status}</b>${p.catatan ? `<br><small>${e(p.catatan)}</small>` : ''}</td>
      <td>${p.status === 'Menunggu Review' ? `<button class="btn ghost sm" data-b="${p.id}">Batalkan</button>` : ''}</td></tr>`)));
  $c().find('[data-b]').on('click', function(){
    if(!confirm('Batalkan pengajuan ini?')) return;
    const p = S.pj.find(x => x.id === +$(this).data('b')); p.status = 'Dibatalkan'; p.catatan = 'Dibatalkan oleh mahasiswa';
    notif(p.nim, `Pengajuan #${p.id} (${namaAlat(p.alat)}): Dibatalkan`); save(); buildNav(); R.riwayat();
  });
};

/* ----- Notifikasi ----- */
R.notifikasi = () => {
  const u = me().u, d = S.notif.filter(n => n.u === u).reverse();
  $c().html(head('Notifikasi', 'Perubahan status pengajuanmu.') +
    (d.length ? d.map(n => `<div class="nt ${n.baca ? '' : 'baru'}">${e(n.pesan)}<br><small>${n.waktu}</small></div>`).join('') : '<p class="sub">Belum ada notifikasi.</p>'));
  S.notif.forEach(n => { if(n.u === u) n.baca = true; }); save(); buildNav();
};

/* ----- Ubah password sendiri (FR-03) ----- */
R.password = () => {
  $c().html(head('Ubah password', `Password baru minimal ${S.cfg.minPw} karakter.`) +
  `<form id="fPw" class="card f" style="max-width:420px" novalidate>
   <label for="p0">Password lama</label><input id="p0" type="password" autocomplete="current-password">
   <label for="p1">Password baru</label><input id="p1" type="password" autocomplete="new-password">
   <label for="p2">Ulangi password baru</label><input id="p2" type="password" autocomplete="new-password">
   <p><button class="btn" type="submit">Simpan password</button></p><div id="pm" role="status"></div></form>`);
  $('#fPw').on('submit', ev => {
    ev.preventDefault();
    const u = me(), a = $('#p0').val(), b = $('#p1').val(), c = $('#p2').val();
    if(a !== u.pw) return pesan('#pm', 'Password lama salah.', 0);
    if(b.length < S.cfg.minPw) return pesan('#pm', `Password baru minimal ${S.cfg.minPw} karakter.`, 0);
    if(b === a) return pesan('#pm', 'Password baru harus berbeda dari yang lama.', 0);
    if(b !== c) return pesan('#pm', 'Ulangi password tidak sama.', 0);
    u.pw = b; save(); $('#fPw')[0].reset(); pesan('#pm', 'Password berhasil diubah.', 1);
  });
};
