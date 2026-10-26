const hariIni = () => new Date().toISOString().slice(0,10);
const tambahHari = (tgl, n) => { const d = new Date(tgl); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const selisih = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

function kartu(a, aksi){
  return `<div class="card alat"><img src="img/${a.img}.svg" alt="${a.nama}"><h3>${a.nama}</h3>
    <span class="pill ${a.stok? '':'habis'}">Stok: ${a.stok}</span><span class="pill">Maks ${a.maks} hari</span>
    ${aksi ? `<button class="btn pinjam" data-kode="${a.kode}" ${a.stok? '':'disabled'}>Pinjam</button>` : ''}</div>`;
}

/* ===== Navigasi dengan Ajax (jQuery .load) ===== */
let homeHTML = '';
function muat(page, kode){
  if(AKSES[page] && !AKSES[page].includes(peran())) page = me() ? 'beranda' : 'login';
  $('#nav a').removeClass('aktif').filter(`[data-page="${page}"]`).addClass('aktif');
  if(R[page]){ R[page](); history.replaceState(null,'','#'+page); buildNav(); window.scrollTo({top:0}); return; }
  if(page === 'beranda'){ $('#content').html(homeHTML); isiBeranda(); history.replaceState(null,'','#beranda'); return; }
  $('#content').html('<p class="sub">Memuat halaman…</p>')
    .load(`pages/${page}.html`, function(_, status){
      if(status === 'error'){ $(this).html('<div class="card"><b>Halaman gagal dimuat.</b><p>Ajax membutuhkan server HTTP. Jalankan <code>python server.py</code> lalu buka http://localhost:8000</p></div>'); return; }
      if(page === 'katalog') initKatalog();
      if(page === 'pengajuan') initForm(kode);
    });
  history.replaceState(null,'','#'+page);
  window.scrollTo({top:0});
}
function isiBeranda(){ $('#homeGrid').html(ALAT.map(a => kartu(a,false)).join('')); }

$(function(){
  init();
  homeHTML = $('#content').html(); isiBeranda();
  $('#menuBtn').on('click', () => $('#nav').toggleClass('open'));
  $(document).on('click', 'a[data-page]', function(e){ e.preventDefault(); $('#nav').removeClass('open'); muat($(this).data('page')); });
  const h = location.hash.slice(1); if(h && h !== 'beranda') muat(h);
});

/* ===== Halaman 2.b: Katalog + simulasi ===== */
function initKatalog(){
  const stok = {}; ALAT.forEach(a => stok[a.kode] = a.stok);
  const sekarang = () => ALAT.map(a => ({...a, stok: stok[a.kode]}));

  function render(){
    const q = $('#cari').val().toLowerCase(), u = $('#urut').val();
    let d = sekarang().filter(a => a.nama.toLowerCase().includes(q));
    if(u === 'stok') d.sort((a,b) => b.stok - a.stok);
    if(u === 'nama') d.sort((a,b) => a.nama.localeCompare(b.nama));
    $('#grid').html(d.length ? d.map(a => kartu(a,true)).join('') : '<p class="sub">Tidak ada alat yang cocok. Ubah kata kunci pencarian.</p>');
  }
  function hitung(){
    const a = ALAT.find(x => x.kode === $('#simAlat').val()), j = +$('#simJml').val() || 0, t = $('#simTgl').val() || hariIni();
    const ok = j > 0 && j <= stok[a.kode];
    $('#simKembali').text(tambahHari(t, a.maks));
    $('#simMaks').text(a.maks + ' hari');
    $('#simSisa').text(ok ? (stok[a.kode] - j) : '–');
    $('#simMsg').attr('class', 'msg ' + (ok ? 'ok' : 'no')).text(ok ? 'Pengajuan memenuhi syarat stok dan durasi.' : `Jumlah harus 1 sampai ${stok[a.kode]}.`);
    $('#simRun').prop('disabled', !ok);
  }
  $('#cari, #urut').on('input change', render);
  $('#grid').on('click', '.pinjam', function(){ muat('pengajuan', $(this).data('kode')); });
  $('#simAlat').html(ALAT.map(a => `<option value="${a.kode}">${a.nama}</option>`).join('')).on('change', hitung);
  $('#simJml, #simTgl').on('input change', hitung);
  $('#simTgl').val(hariIni()).attr('min', hariIni());
  render(); hitung();

  let timer;
  $('#simRun').on('click', function(){
    const kode = $('#simAlat').val(), j = +$('#simJml').val(), steps = $('#simAlur li');
    const awal = stok[kode]; let i = 0; steps.removeClass('on done'); clearInterval(timer);
    $(this).prop('disabled', true);
    timer = setInterval(() => {
      steps.slice(0,i).addClass('done').removeClass('on'); steps.eq(i).addClass('on');
      if(i === 3) stok[kode] = awal - j;            // Dipinjam: stok berkurang
      if(i === 4){ stok[kode] = awal; steps.eq(i).removeClass('on').addClass('done'); clearInterval(timer); }
      render(); hitung(); i++;
    }, 900);
  });
  $('#simReset').on('click', () => { clearInterval(timer); ALAT.forEach(a => stok[a.kode] = a.stok); $('#simAlur li').removeClass('on done'); render(); hitung(); });
}

/* ===== Halaman 2.c: Form pengajuan + validasi ===== */
function initForm(kodeAwal){
  const $f = $('#formAjuan');
  const alatDipilih = () => ALAT.find(x => x.kode === $('#alat').val());
  $('#alat').append(ALAT.map(a => `<option value="${a.kode}">${a.nama}</option>`).join(''));
  if(kodeAwal) $('#alat').val(kodeAwal);
  const isiAkun = () => { const u = me(); if(u){ $('#nama').val(u.n).prop('readonly', true); $('#nim').val(u.u).prop('readonly', true); } };
  isiAkun();
  $('#tglPinjam, #tglKembali').attr('min', hariIni());
  function info(){ const a = alatDipilih();
    $('#infoAlat').text(a ? `Stok tersedia ${a.stok}, maksimal pinjam ${a.maks} hari.` : 'Pilih alat untuk melihat stok dan batas durasi.'); }
  $('#alat').on('change', function(){ info(); $('#tglPinjam').trigger('change'); }); info();
  $('#tglPinjam').on('change', function(){ const a = alatDipilih(); if(a && this.value) $('#tglKembali').val(tambahHari(this.value, a.maks)); });

  const aturan = {
    nama: v => v.trim().length >= 3 || 'Nama minimal 3 karakter.',
    nim: v => /^\d{11}$/.test(v) || 'NIM harus 11 digit angka.',
    alat: v => !!v || 'Pilih alat yang akan dipinjam.',
    jumlah: v => { const a = alatDipilih(); if(!(+v >= 1)) return 'Jumlah minimal 1.'; return !a || +v <= a.stok || `Jumlah melebihi stok (${a.stok}).`; },
    tglPinjam: v => (!!v && v >= hariIni()) || 'Tanggal pinjam wajib diisi dan tidak boleh lampau.',
    tglKembali: v => { const p = $('#tglPinjam').val(), a = alatDipilih();
      if(!v) return 'Tanggal kembali wajib diisi.'; if(p && v < p) return 'Tanggal kembali tidak boleh sebelum tanggal pinjam.';
      return !(p && a && selisih(p, v) > a.maks) || `Durasi melebihi batas ${a.maks} hari untuk ${a.nama}.`; },
    kelas: v => !!v || 'Pilih kelas.',
    prodi: v => v.trim().length >= 3 || 'Prodi wajib diisi.',
    matkul: v => v.trim().length >= 3 || 'Mata kuliah wajib diisi.',
    dosen: v => v.trim().length >= 3 || 'Dosen pengampu wajib diisi.',
    keperluan: v => v.trim().length >= 10 || 'Jelaskan keperluan minimal 10 karakter.'
  };
  function cek(id){ const r = aturan[id]($('#'+id).val()), ok = r === true;
    $('#'+id).toggleClass('bad', !ok); $('#e_'+id).text(ok ? '' : r); return ok; }
  Object.keys(aturan).forEach(id => $('#'+id).on('blur change', () => cek(id)));

  $f.on('submit', function(e){
    e.preventDefault();                                   // validasi dulu sebelum kirim ke server
    const valid = Object.keys(aturan).map(cek).every(Boolean);
    if(!valid){ $('#hasil').attr('class','msg no').text('Formulir belum benar. Perbaiki kolom bertanda merah.'); $('.bad').first().focus(); return; }
    const data = {}; $f.serializeArray().forEach(x => data[x.name] = x.value);
    data.nama = $('#nama').val(); data.nim = $('#nim').val();
    const er = cekBatas(data); if(er){ $('#hasil').attr('class','msg no').text(er); return; }
    $('#kirim').prop('disabled', true).text('Mengirim…');
    $.ajax({url:'/api/pengajuan', method:'POST', contentType:'application/json', data:JSON.stringify(data)})
      .done(() => { const id = tambahPj(data); $('#hasil').attr('class','msg ok').text(`Pengajuan #${id} terkirim. Status: Menunggu Review.`); $f[0].reset(); isiAkun(); info(); })
      .fail(() => $('#hasil').attr('class','msg no').text('Server tidak merespons. Jalankan aplikasi dengan: python server.py'))
      .always(() => $('#kirim').prop('disabled', false).text('Kirim pengajuan'));
  });
}
