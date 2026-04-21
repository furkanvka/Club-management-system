import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { W, Section, StatBox, TextLine, ImgBox, Field, Select, Textarea, UploadBox, BarChart, TableBox } from '../components/ui';

function DashContent({ active, role }) {
  if (active === "Profil Goruntule") return (
    <div className="max-w-lg space-y-3">
      <Section title="Profil Bilgileri" action="Duzenle"/>
      <div className="flex items-center gap-4 border border-gray-300 rounded p-4 mb-4">
        <ImgBox w="w-14" h="h-14" label="Foto"/>
        <div className="space-y-1.5"><TextLine w="w-36" dark/><TextLine w="w-24"/></div>
      </div>
      {["Ad Soyad","E-posta","Telefon","Bolum / Sinif","Kulup Rolu","Kayit Tarihi"].map(f => (
        <div key={f} className="border border-gray-300 rounded px-4 py-3">
          <div className="text-gray-400 uppercase tracking-wide mb-1" style={{fontSize:"9px"}}>{f}</div>
          <TextLine w="w-40" dark/>
        </div>
      ))}
    </div>
  );

  if (active === "Profil Duzenle") return (
    <div className="max-w-lg space-y-4">
      <Section title="Profil Duzenle"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <ImgBox w="w-14" h="h-14" label="Foto"/>
          <button className={W.btn}>Fotograf Degistir</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" placeholder="——"/><Field label="Soyad" placeholder="——"/>
        </div>
        <Field label="E-posta" placeholder="——"/>
        <Field label="Bolum" placeholder="——"/>
        <div className="flex gap-2 pt-1">
          <button className={W.btnFill}>Kaydet</button>
          <button className={W.btn}>Iptal</button>
        </div>
      </div>
    </div>
  );

  if (active === "Duyurular" || active === "Etkinlik Duyurusu") return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-1">
        <input placeholder="Ara..." className={`${W.input} flex-1`} />
        <button className={W.btn}>Filtrele</button>
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="border border-gray-300 rounded p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <TextLine w="w-48" dark/><span className={W.tag}>Yaklasan</span>
          </div>
          <TextLine w="w-full" className="mb-1.5"/><TextLine w="w-3/4"/>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-gray-400" style={{fontSize:"10px"}}>
            <span>Tarih: ——/——</span><span>Konum: ——</span><span>Kota: —/—</span>
            <button className={`${W.btnFill} ml-auto px-3 py-1.5`} style={{fontSize:"10px"}}>Basvur</button>
          </div>
        </div>
      ))}
    </div>
  );

  if (active === "Basvurularim") return (
    <div className="space-y-4"><Section title="Basvurularim"/>
      <TableBox headers={["Etkinlik","Basvuru Tarihi","Durum","Aksiyon"]} rows={4}/>
    </div>
  );

  if (["Genel Belgeler","Proje Belgeleri","Yetkili Belgeler","Tum Belgeler"].includes(active)) return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input placeholder="Ara..." className={`${W.input} flex-1`} />
        <button className={W.btn}>Kategori</button>
        {active === "Tum Belgeler" && <button className={W.btnFill}>+ Yukle</button>}
      </div>
      <TableBox headers={["Belge Adi","Kategori","Yukleyen","Tarih","Indir"]} rows={5}/>
    </div>
  );

  if (active === "Belge Yukle") return (
    <div className="max-w-lg space-y-4"><Section title="Belge Yukle"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Field label="Belge Basligi" placeholder="——"/>
        <Select label="Kategori" options={["Toplanti Raporu","Gorev Belgesi","Genel"]}/>
        <UploadBox label="Dosya Sec"/>
        <Textarea label="Aciklama (opsiyonel)" placeholder="——"/>
        <div className="flex gap-2"><button className={W.btnFill}>Yukle</button><button className={W.btn}>Iptal</button></div>
      </div>
    </div>
  );

  if (active === "Belge Onay") return (
    <div className="space-y-4"><Section title="Belge Onay Kuyrugu"/>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid border-b border-gray-300 bg-gray-50" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 130px"}}>
          {["Belge","Yukleyen","Kategori","Tarih","Islem"].map(h => (
            <div key={h} className="px-3 py-2 font-bold text-gray-500 uppercase tracking-wide" style={{fontSize:"9px"}}>{h}</div>
          ))}
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="grid border-b border-gray-100 last:border-0 items-center" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 130px"}}>
            <div className="px-3 py-3"><TextLine w="w-28" dark/></div>
            <div className="px-3 py-3"><TextLine w="w-20"/></div>
            <div className="px-3 py-3"><span className={W.tag}>——</span></div>
            <div className="px-3 py-3"><TextLine w="w-16"/></div>
            <div className="px-3 py-3 flex gap-1">
              <button className={`${W.btnFill} px-2 py-1`} style={{fontSize:"10px"}}>Onayla</button>
              <button className={`${W.btn} px-2 py-1`} style={{fontSize:"10px"}}>Reddet</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (active === "Atanan Gorevler") return (
    <div className="space-y-4"><Section title="Gorevlerim"/>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <StatBox label="Toplam" value="12"/><StatBox label="Devam Eden" value="5"/><StatBox label="Tamamlanan" value="7"/>
      </div>
      <TableBox headers={["Gorev","Proje","Son Tarih","Durum"]} rows={5}/>
    </div>
  );

  if (active === "Durum Guncelle") return (
    <div className="max-w-lg space-y-4"><Section title="Gorev Durum Guncelle"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <div className="border border-gray-200 rounded p-3 bg-gray-50">
          <div className="text-gray-400 uppercase mb-1" style={{fontSize:"9px"}}>Secili Gorev</div>
          <TextLine w="w-48" dark/>
        </div>
        <div>
          <label className={W.label}>Yeni Durum</label>
          <div className="grid grid-cols-3 gap-2">
            {["Baslamadi","Devam Ediyor","Tamamlandi"].map(s => (
              <div key={s} className="border border-gray-300 rounded px-3 py-2.5 text-center text-xs text-gray-600 cursor-pointer hover:bg-gray-100">{s}</div>
            ))}
          </div>
        </div>
        <Textarea label="Not (opsiyonel)" placeholder="——"/>
        <button className={W.btnFill}>Guncelle</button>
      </div>
    </div>
  );

  if (active === "Gorev Atama") return (
    <div className="max-w-lg space-y-4"><Section title="Gorev Ata"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Field label="Gorev Basligi" placeholder="——"/>
        <Select label="Atanacak Uye" options={["Uye Sec","Ali Yilmaz","Fatma Koc","Ahmet Demir"]}/>
        <Select label="Proje / Etkinlik" options={["Sec","Proje A","Etkinlik B"]}/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Son Tarih" placeholder="gg/aa/yyyy"/>
          <Select label="Oncelik" options={["Normal","Yuksek","Kritik"]}/>
        </div>
        <Textarea label="Aciklama" placeholder="——"/>
        <div className="flex gap-2"><button className={W.btnFill}>Gorevi Ata</button><button className={W.btn}>Iptal</button></div>
      </div>
    </div>
  );

  if (active === "Gorev Ozeti") return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Toplam" value="24"/><StatBox label="Bekleyen" value="6"/>
        <StatBox label="Devam" value="10"/><StatBox label="Bitti" value="8"/>
      </div>
      <Section title="Ekip Gorev Listesi"/>
      <TableBox headers={["Gorev","Atanan","Son Tarih","Durum","Ilerleme"]} rows={6}/>
    </div>
  );

  if (active === "Proje Olustur") return (
    <div className="max-w-lg space-y-4"><Section title="Proje Olustur"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Field label="Proje Adi" placeholder="——"/>
        <Textarea label="Aciklama" placeholder="——"/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Baslangic Tarihi" placeholder="gg/aa/yyyy"/>
          <Field label="Bitis Tarihi" placeholder="gg/aa/yyyy"/>
        </div>
        <Select label="Oncelik" options={["Normal","Yuksek","Kritik"]}/>
        <div className="flex gap-2 pt-1"><button className={W.btnFill}>Proje Olustur</button><button className={W.btn}>Iptal</button></div>
      </div>
    </div>
  );

  if (active === "Proje Detaylari") return (
    <div className="space-y-4 max-w-2xl"><Section title="Proje Detaylari"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {["Proje Adi","Durum","Baslangic Tarihi","Bitis Tarihi","Ekip Lideri","Uye Sayisi"].map(f => (
            <div key={f}>
              <div className="text-gray-400 uppercase tracking-wide mb-1" style={{fontSize:"9px"}}>{f}</div>
              <TextLine w="w-32" dark/>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="text-gray-400 uppercase tracking-wide mb-2" style={{fontSize:"9px"}}>Ilerleme</div>
          <div className="w-full h-3 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
            <div className="h-full w-2/3 bg-gray-400 rounded-full"/>
          </div>
          <div className="text-gray-400 mt-1" style={{fontSize:"10px"}}>14 / 21 gorev tamamlandi</div>
        </div>
      </div>
    </div>
  );

  if (active === "Uye Listesi") return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input placeholder="Ara..." className={`${W.input} flex-1`} />
        <button className={W.btn}>Filtrele</button>
        {["baskan","sayman","sekreter"].includes(role) && <button className={W.btnFill}>+ Uye Kaydet</button>}
      </div>
      <TableBox headers={["Ad Soyad","E-posta","Rol","Durum","Kayit Tarihi"]} rows={6}/>
    </div>
  );

  if (active === "Uye Bilgileri") return (
    <div className="space-y-4"><Section title="Ekip Uye Bilgileri"/>
      <TableBox headers={["Ad Soyad","Rol","Gorev Sayisi","Son Aktivite","Islem"]} rows={5}/>
    </div>
  );

  if (active === "Uye Gecmisi") return (
    <div className="space-y-4"><Section title="Uye Gecmisi"/>
      <input placeholder="Uye Ara..." className={`${W.input} mb-1`} />
      <TableBox headers={["Ad Soyad","Katilim Tarihi","Etkinlikler","Gorevler","Durum"]} rows={6}/>
    </div>
  );

  if (active === "Ekip Tanimla") return (
    <div className="max-w-lg space-y-4"><Section title="Yeni Ekip Olustur"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Field label="Ekip Adi" placeholder="——"/>
        <Select label="Proje / Etkinlik" options={["Sec","Proje A","Etkinlik B"]}/>
        <Textarea label="Aciklama" placeholder="——"/>
        <div className="flex gap-2"><button className={W.btnFill}>Ekip Olustur</button><button className={W.btn}>Iptal</button></div>
      </div>
    </div>
  );

  if (active === "Lider Ata") return (
    <div className="max-w-lg space-y-4"><Section title="Ekip Lideri Ata"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Select label="Ekip / Etkinlik" options={["Sec","Ekip A","Ekip B"]}/>
        <Select label="Lider Olacak Uye" options={["Sec","Ali Yilmaz","Fatma Koc"]}/>
        <div className="flex gap-2"><button className={W.btnFill}>Lider Ata</button><button className={W.btn}>Iptal</button></div>
      </div>
    </div>
  );

  if (active === "Flag Yonetimi") return (
    <div className="space-y-4 max-w-2xl">
      <Section title="Flag Yonetimi — Yonetici Kadrosu" action="+ Yonetici Ekle"/>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid border-b border-gray-300 bg-gray-50" style={{gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px"}}>
          {["Ad Soyad","Gorevi","Yonetici","Finans","Docs","Islem"].map(h => (
            <div key={h} className="px-3 py-2 font-bold text-gray-500 uppercase tracking-wide" style={{fontSize:"9px"}}>{h}</div>
          ))}
        </div>
        {[
          {name:"Ali Yilmaz",   r:"Kulup Baskani", flags:[true,true,true]},
          {name:"Mehmet Demir", r:"Sayman",         flags:[true,true,false]},
          {name:"Ayse Kaya",    r:"Sekreter",       flags:[true,false,true]},
        ].map((u,i) => (
          <div key={i} className="grid border-b border-gray-100 last:border-0 items-center" style={{gridTemplateColumns:"1fr 1fr 80px 80px 80px 60px"}}>
            <div className="px-3 py-3"><TextLine w="w-24" dark/></div>
            <div className="px-3 py-3 text-xs text-gray-500">{u.r}</div>
            {u.flags.map((f,j) => (
              <div key={j} className="px-3 py-3 flex justify-center">
                <div className={`w-5 h-5 border rounded flex items-center justify-center font-bold ${f ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-300"}`} style={{fontSize:"10px"}}>
                  {f ? "x" : ""}
                </div>
              </div>
            ))}
            <div className="px-3 py-3"><button className={`${W.btn} px-2 py-1`} style={{fontSize:"10px"}}>Duzenle</button></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (active === "Etkinlik Olustur") return (
    <div className="max-w-lg space-y-4"><Section title="Etkinlik Olustur"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Field label="Etkinlik Adi" placeholder="——"/>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tarih" placeholder="gg/aa/yyyy"/><Field label="Saat" placeholder="ss:dd"/>
        </div>
        <Field label="Konum" placeholder="——"/>
        <Field label="Kota (max katilimci)" placeholder="——"/>
        <Select label="Sorumlu Ekip Lideri" options={["Sec","Ali Yilmaz","Fatma Koc"]}/>
        <Textarea label="Aciklama" placeholder="——"/>
        <div className="flex gap-2"><button className={W.btnFill}>Etkinlik Olustur</button><button className={W.btn}>Taslak Kaydet</button></div>
      </div>
    </div>
  );

  if (active === "Takvim") return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <Section title="Etkinlik Takvimi"/>
        <div className="flex gap-1">
          <button className={W.btn}>&lt;</button>
          <span className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600">Nisan 2026</span>
          <button className={W.btn}>&gt;</button>
        </div>
      </div>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-50">
          {["Pzt","Sal","Car","Per","Cum","Cmt","Paz"].map(d => (
            <div key={d} className="py-2 text-center font-bold text-gray-500 border-r border-gray-200 last:border-0" style={{fontSize:"9px"}}>{d}</div>
          ))}
        </div>
        {Array.from({length:5}).map((_,row) => (
          <div key={row} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
            {Array.from({length:7}).map((_,col) => {
              const day = row*7+col+1;
              const hasEvent = [5,12,18,23].includes(day);
              return (
                <div key={col} className="h-16 border-r border-gray-100 last:border-0 p-1.5 text-xs text-gray-400 hover:bg-gray-50">
                  {day <= 30 && <span>{day}</span>}
                  {hasEvent && day <= 30 && <div className="mt-1 border border-gray-400 rounded px-1 py-0.5 text-gray-600 truncate bg-gray-100" style={{fontSize:"9px"}}>Etkinlik</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border border-gray-400 rounded px-4 py-2.5 text-xs text-gray-600 bg-gray-50">
        ! Uyari: 18 Nisan ve 23 Nisan tarihlerinde etkinlik cakismasi tespit edildi.
      </div>
    </div>
  );

  if (active === "Gecmis Etkinlikler") return (
    <div className="space-y-4"><Section title="Gecmis Etkinlikler"/>
      <TableBox headers={["Etkinlik Adi","Tarih","Katilimci","Ekip Lideri","Rapor"]} rows={5}/>
    </div>
  );

  if (active === "Etkinlik Detaylari") return (
    <div className="max-w-2xl space-y-4"><Section title="Etkinlik Detay Yonetimi"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {["Etkinlik Adi","Tarih","Konum","Kota","Mevcut Katilimci","Ekip Lideri"].map(f => (
            <div key={f}>
              <div className="text-gray-400 uppercase tracking-wide mb-1" style={{fontSize:"9px"}}>{f}</div>
              <TextLine w="w-32" dark/>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4"><Textarea label="Aciklama" placeholder="——"/></div>
        <div className="flex gap-2"><button className={W.btnFill}>Guncelle</button><button className={W.btn}>Duyuru Gonder</button></div>
      </div>
    </div>
  );

  if (active === "Basvurular") return (
    <div className="space-y-4"><Section title="Etkinlik Basvurulari"/>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid border-b border-gray-300 bg-gray-50" style={{gridTemplateColumns:"1fr 1fr 1fr 140px"}}>
          {["Ad Soyad","Basvuru Tarihi","Durum","Islem"].map(h => (
            <div key={h} className="px-3 py-2 font-bold text-gray-500 uppercase tracking-wide" style={{fontSize:"9px"}}>{h}</div>
          ))}
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="grid border-b border-gray-100 last:border-0 items-center" style={{gridTemplateColumns:"1fr 1fr 1fr 140px"}}>
            <div className="px-3 py-3"><TextLine w="w-24" dark/></div>
            <div className="px-3 py-3"><TextLine w="w-20"/></div>
            <div className="px-3 py-3"><span className={W.tag}>Beklemede</span></div>
            <div className="px-3 py-3 flex gap-1">
              <button className={`${W.btnFill} px-2 py-1`} style={{fontSize:"10px"}}>Kabul</button>
              <button className={`${W.btn} px-2 py-1`} style={{fontSize:"10px"}}>Red</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (active === "Toplanti Raporu") return (
    <div className="space-y-4"><Section title="Toplanti Raporlari" action="+ Rapor Ekle"/>
      <TableBox headers={["Toplanti Basligi","Tarih","Katilimcilar","Belge","Islem"]} rows={4}/>
    </div>
  );

  if (active === "Organizasyon") return (
    <div className="space-y-4 max-w-2xl"><Section title="Organizasyon Plani"/>
      {[1,2,3].map(i => (
        <div key={i} className="border border-gray-300 rounded p-4 flex gap-4 items-center">
          <div className="w-8 h-8 border border-gray-400 rounded flex items-center justify-center text-xs text-gray-500 font-bold shrink-0">{i}</div>
          <div className="flex-1 space-y-1.5"><TextLine w="w-40" dark/><TextLine w="w-64"/></div>
          <span className={W.tag}>——</span>
        </div>
      ))}
    </div>
  );

  if (active === "Gelir/Gider Kaydi") return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Toplam Gelir" value="12.450"/><StatBox label="Toplam Gider" value="8.230"/><StatBox label="Net Bakiye" value="4.220"/>
      </div>
      <Section title="Islem Listesi" action="+ Yeni Islem"/>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="border-b border-gray-300 bg-gray-50 flex gap-2 px-3 py-2">
          {["Tumu","Gelir","Gider"].map((t,i) => (
            <button key={t} className={`${i===0 ? W.btnFill : W.btn} px-3 py-1`} style={{fontSize:"10px"}}>{t}</button>
          ))}
        </div>
        <TableBox headers={["Aciklama","Tur","Tutar","Belge","Tarih"]} rows={5}/>
      </div>
    </div>
  );

  if (active === "Fis Yukleme") return (
    <div className="max-w-lg space-y-4"><Section title="Fis / Makbuz Yukle"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Select label="Islem Sec" options={["Islem Sec","Ofis Malz. - 450 TL","Yazici - 2.200 TL"]}/>
        <UploadBox label="Fis / Fatura"/>
        <Textarea label="Not" placeholder="——"/>
        <button className={W.btnFill}>Yukle ve Eslesir</button>
      </div>
    </div>
  );

  if (active === "Finans Raporu") return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="w-40"><Field label="Baslangic Tarihi" placeholder="gg/aa/yyyy"/></div>
        <div className="w-40"><Field label="Bitis Tarihi" placeholder="gg/aa/yyyy"/></div>
        <button className={W.btnFill}>Rapor Olustur</button>
        <button className={W.btn}>Disa Aktar</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Toplam Gelir" value="12.450"/><StatBox label="Toplam Gider" value="8.230"/><StatBox label="Net Bakiye" value="4.220"/>
      </div>
      <Section title="Gelir / Gider Grafigi"/>
      <div className="border border-gray-300 rounded p-4"><BarChart/></div>
      <Section title="Kategori Dagilimi"/>
      <TableBox headers={["Kategori","Gelir","Gider","Net"]} rows={4}/>
    </div>
  );

  if (active === "Yedekleme" || active === "Yedekleme Periyodu") return (
    <div className="max-w-lg space-y-4"><Section title="Yedekleme"/>
      <div className="border border-gray-300 rounded p-5 space-y-4">
        <Select label="Yedekleme Sikligi" options={["Gunluk","Haftalik","Aylik"]}/>
        <Field label="Yedekleme Saati" placeholder="ss:dd"/>
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <div><div className="text-xs text-gray-600 font-medium">Son Yedekleme</div><TextLine w="w-36" className="mt-1"/></div>
          <button className={W.btn}>Manuel Yedek Al</button>
        </div>
        <button className={W.btnFill}>Ayarlari Kaydet</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Toplam" value="—"/><StatBox label="Aktif" value="—"/><StatBox label="Bu Ay" value="—"/>
      </div>
      <Section title={active}/>
      <TableBox headers={["Alan 1","Alan 2","Alan 3","Durum"]} rows={4}/>
    </div>
  );
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "baskan"; 

  return (
    <DashboardLayout role={role}>
      {({ active, role }) => <DashContent active={active} role={role} />}
    </DashboardLayout>
  );
}
