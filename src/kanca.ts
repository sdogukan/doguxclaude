/** UserPromptSubmit kancası: konuşulan deponun yapısını verir.
 *
 *  Neden gerekli (üç canlı oturumda ölçüldü): açılışta enjekte edilen yapı,
 *  `dxc`'nin çalıştırıldığı klasöre aittir ve oturum boyunca sabit kalır.
 *  Ev dizininden açılan oturumda ajan bir projeye girince yapıyı baştan
 *  keşfetti; api-platform'de olmayan README.md'yi tahmin edip hata aldı.
 *
 *  Kural neden "bulunduğun depo" DEĞİL: ölçüldü, işe yaramıyor. Sen bir depoyu
 *  sorduğunda model henüz orada değildir, oraya cevap verirken girer. Bulunduğun
 *  klasöre bakan kanca yapıyı hep bir istem geç verir ve o istemde artık gereksizdir.
 *  (web-app yapısı api-platform sorulurken, api-platform yapısı oturum kimliği
 *  sorulurken geldi. İkisi de boşa gitti.)
 *
 *  Bu yüzden iki kaynağa birden bakılır:
 *  1. İstemde adı geçen depo — asıl kaynak, soru sorulmadan önce verir.
 *  2. İçinde bulunduğun depo — sen `cd` yapıp `dxc` demeden çalışmaya devam edersen.
 *
 *  Sınır: bir depo oturum başına EN FAZLA BİR KEZ yazılır. Böylece maliyet
 *  oturum boyunca sınırlıdır; on bir deponun hepsi girse toplam ~4.000 token.
 *
 *  Kanca hiçbir koşulda oturumu bozmamalı: her hata yutulur, çıkış kodu 0,
 *  stdout boş kalır. Boş çıktı "hiçbir şey ekleme" demektir. */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { depoBlogu } from './baglam.js';
import { mevcutAciklamalar } from './harita.js';
import { iceridekiDepo } from './tarama.js';
import { KOK, oku, yaz } from './util.js';

/** dxc'nin açılışta hangi depoyu enjekte ettiği; kanca aynısını tekrar yazmasın. */
export const ACILIS_DEPO = 'DOGUXCLAUDE_ACILIS_DEPO';

const OTURUM_DIZINI = join(KOK, 'oturum');
const OMUR_GUN = 7;

function durumYolu(oturum: string): string {
  return join(OTURUM_DIZINI, `${oturum.replace(/[^A-Za-z0-9_-]/g, '')}.txt`);
}

/** Bir haftadan eski oturum izleri silinir; dizin sınırsız büyümesin. */
function eskileriSil(): void {
  try {
    const sinir = Date.now() - OMUR_GUN * 86_400_000;
    for (const ad of readdirSync(OTURUM_DIZINI)) {
      const y = join(OTURUM_DIZINI, ad);
      if (statSync(y).mtimeMs < sinir) rmSync(y, { force: true });
    }
  } catch { /* dizin yoksa yapacak iş yok */ }
}

/** Türkçe harfleri sadeleştirir: kullanıcı "web-app" yazar, klasör "web-app"dir.
 *
 *  Harf harf değiştirme yetmiyor: JavaScript Türkçe yerel ayarı kullanmadığı için
 *  'İ'.toLowerCase() iki kod noktası üretir (i + birleşik nokta) ve eşleşme bozulur.
 *  Bu yüzden önce NFD ile ayrıştırıp birleşik işaretleri atıyoruz; ç, ö, ü, ş, ğ, İ
 *  hepsi böyle çözülür. Ayrışmayan tek harf noktasız ı, o elle çevriliyor. */
export function sadelestir(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ı/g, 'i');
}

/** Haritadaki depoların yolları. Tarama yapılmaz: index.md zaten diskte. */
export function haritadakiDepolar(ev = homedir()): string[] {
  return [...mevcutAciklamalar().keys()].map((goreli) => join(ev, goreli));
}

/** İstemde adı geçen depolar. Ad en az üç harf olmalı ki "app" gibi
 *  kısa adlar her cümleye takılmasın. */
export function istemdekiDepolar(istem: string, depolar: string[]): string[] {
  const metin = sadelestir(istem);
  return depolar.filter((d) => {
    const ad = sadelestir(basename(d));
    return ad.length >= 3 && metin.includes(ad);
  });
}

export interface Karar { blok: string[]; eklenen: string[] }

/** Saf karar: hiçbir şey yazmaz, yalnız ne enjekte edileceğini söyler. */
export function karar(
  istem: string,
  cwd: string,
  yazilmis: Set<string>,
  depolar: string[],
): Karar {
  const adaylar: string[] = [...istemdekiDepolar(istem, depolar)];
  const burasi = iceridekiDepo(cwd);
  if (burasi && !adaylar.includes(burasi)) adaylar.push(burasi);

  const blok: string[] = []; const eklenen: string[] = [];
  for (const d of adaylar) {
    if (yazilmis.has(d)) continue;
    blok.push(depoBlogu(d));
    eklenen.push(d);
  }
  return { blok, eklenen };
}

export async function kancaCalistir(): Promise<void> {
  let ham = '';
  for await (const parca of process.stdin) ham += parca;
  const g = JSON.parse(ham) as { session_id?: string; cwd?: string; prompt?: string };
  const oturum = g.session_id ?? '';
  if (!oturum) return;

  const yol = durumYolu(oturum);
  const yazilmis = new Set((oku(yol) ?? '').split('\n').filter(Boolean));
  // Açılışta sistem istemine giren depo zaten yazılmış sayılır.
  const acilis = process.env[ACILIS_DEPO];
  if (acilis) yazilmis.add(acilis);

  const k = karar(g.prompt ?? '', g.cwd ?? process.cwd(), yazilmis, haritadakiDepolar());
  if (!k.eklenen.length) return;

  for (const d of k.eklenen) yazilmis.add(d);
  yaz(yol, [...yazilmis].join('\n'));
  eskileriSil();

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: k.blok.join('\n\n---\n\n') },
  }));
}
