/** Hafıza: `index.md` içinde, harita bölümünün altında duran otuz satır.
 *
 *  Her satır bir oturum, tek cümle. Yeni oturum en üste eklenir, otuzuncudan
 *  sonrası alttan düşer. Cümleyi oturum kapanırken model yazar.
 *
 *  İki yazıcı aynı dosyaya yazar ve BİRBİRİNİN BÖLÜMÜNE DOKUNMAZ:
 *  - harita tazeleyici yalnız üst bölümü yeniden üretir,
 *  - çıkış yazıcısı yalnız alt bölüme satır ekler.
 *  Ayırıcı `## Hafıza` başlığıdır; ondan sonrası hafızadır. */
import { spawnSync } from 'node:child_process';
import { bugun, HARITA_YOLU, oku, yaz } from './util.js';

export const HAFIZA_BASLIK = '## Hafıza';
export const TAVAN = 30;

const ISTEM = `Aşağıda bir çalışma oturumunun konuşması var (araç çıktıları yok, yalnız insan ve model metni).

Tek satır yaz, tam olarak şu biçimde:
<klasörler> | <tek cümle>

<klasörler>: ÜZERİNDE ÇALIŞILAN proje/depo KÖKLERİNİN adları. Oturumun açıldığı
yer DEĞİL, işin geçtiği yer. BU ALAN ZORUNLUDUR, boş bırakma.

  - Yalnız KÖK adını yaz. Alt klasör yazma: "packages/api" değil, deponun adı.
  - Tam yol yazma, sadece son parça.
  - Birden çok proje varsa virgülle ayır, en çok çalışılan başta, en fazla üçü.
  - Konuşmada dosya yolları, komutlar ve depo adları geçer; oradan çıkar.
    Örneğin "~/Projects/web-app/README.md" geçiyorsa klasör "web-app"tir.

<tek cümle>: bu oturumda ne yapıldı ve nerede kalındı. En fazla 20 kelime.
Somut ol: hangi karar, hangi iş, hangi açık nokta. Genel laf etme.

Başka hiçbir şey yazma: giriş yok, tırnak yok, madde işareti yok.`;

/** Dosyayı ikiye ayırır. Hafıza başlığı yoksa alt bölüm boştur. */
export function bolumler(metin: string): { harita: string; hafiza: string[] } {
  const i = metin.indexOf(`\n${HAFIZA_BASLIK}`);
  if (i < 0) return { harita: metin.trimEnd(), hafiza: [] };
  const alt = metin.slice(i + 1);
  const hafiza = alt.split('\n').filter((s) => s.startsWith('- '));
  return { harita: metin.slice(0, i).trimEnd(), hafiza };
}

/** İki bölümü tek metne birleştirir. Hafıza boşsa başlık da yazılmaz. */
export function birlestir(harita: string, hafiza: string[]): string {
  const bas = harita.trimEnd();
  if (!hafiza.length) return `${bas}\n`;
  return `${bas}\n\n${HAFIZA_BASLIK}\n\nSon oturumlar, en yeni üstte.\n\n${hafiza.join('\n')}\n`;
}

/** Var olan haritadaki hafıza satırlarını okur; harita yeniden yazılırken korunur. */
export function mevcutHafiza(): string[] {
  const icerik = oku(HARITA_YOLU);
  return icerik ? bolumler(icerik).hafiza : [];
}

/** Yeni satırı en üste koyar, tavanı aşanı alttan atar. */
export function ekle(hafiza: string[], satir: string): string[] {
  return [satir, ...hafiza].slice(0, TAVAN);
}

/** Konuşmayı kayıttan çıkarır: araç çağrıları ve çıktıları atılır.
 *  Yalnız SON parça alınır — "nerede kaldık" sorusunun cevabı sondadır ve
 *  girdi sınırlı kalınca çağrı da hızlı olur. Ölçüldü: kaydın yalnız %6,4'ü
 *  konuşmadır, gerisi araç çıktısıdır. */
export function konusmaKuyrugu(kayitYolu: string, tavanKarakter = 25_000): string {
  const ham = oku(kayitYolu);
  if (!ham) return '';
  const parcalar: string[] = [];
  for (const satir of ham.split('\n')) {
    if (!satir.trim()) continue;
    let k: { type?: string; message?: { content?: unknown } };
    try { k = JSON.parse(satir); } catch { continue; }
    if (k.type !== 'user' && k.type !== 'assistant') continue;
    const kim = k.type === 'user' ? 'İNSAN' : 'MODEL';
    const ic = k.message?.content;
    if (typeof ic === 'string') { if (ic.trim()) parcalar.push(`${kim}: ${ic.trim()}`); continue; }
    if (!Array.isArray(ic)) continue;
    for (const b of ic as { type?: string; text?: string }[]) {
      if (b.type === 'text' && b.text?.trim()) parcalar.push(`${kim}: ${b.text.trim()}`);
    }
  }
  const tam = parcalar.join('\n\n');
  return tam.length > tavanKarakter ? tam.slice(-tavanKarakter) : tam;
}

export interface OturumOzeti {
  /** Üzerinde çalışılan klasör adları, virgülle. Model söyleyemediyse null. */
  proje: string | null;
  cumle: string;
}

/** Modeli bir kez çağırır. Başarısızsa null: hafıza yazılmaz, iş durmaz.
 *
 *  Projeyi de model söyler, kod değil. Sebebi ölçüldü: oturum kök dizinde
 *  açılıp başka bir depo üzerinde çalışılabiliyor; açılış klasörünü yazmak
 *  yanıltıcı olurdu. Konuşma zaten modelin elinde, doğru cevabı o biliyor. */
export function oturumCumlesi(konusma: string, zamanAsimiMs = 120_000): OturumOzeti | null {
  if (konusma.trim().length < 200) return null;   // konuşulmamış oturuma cümle yazma
  const r = spawnSync('claude', ['-p'], {
    input: `${ISTEM}\n\n---\n\n${konusma}`, encoding: 'utf8',
    timeout: zamanAsimiMs, maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0 || !r.stdout) return null;
  const ham = r.stdout.trim().split('\n').map((s) => s.trim()).filter(Boolean)[0];
  if (!ham) return null;
  return ayristir(ham);
}

/** `klasörler | cümle` biçimini ayırır. Ayraç yoksa tamamı cümledir.
 *  Klasör listesi virgüllü olabilir; en fazla üçe kırpılır. */
export function ayristir(satir: string): OturumOzeti {
  const temiz = satir.replace(/^[-*]\s*/, '').trim();
  const i = temiz.indexOf('|');
  if (i < 0) return { proje: null, cumle: kirp(temiz) };
  const ham = temiz.slice(0, i).replace(/["'`]/g, '');
  // Model yine de yol verirse son parçayı al: hafızada kök adı görünmeli.
  const adlar = ham.split(',').map((s) => s.trim().replace(/\/+$/, '').split('/').pop()!.trim())
    .filter((s) => s && s !== '-' && s !== '~').slice(0, 3);
  const cumle = kirp(temiz.slice(i + 1));
  return { proje: adlar.length ? adlar.join(', ') : null, cumle };
}

function kirp(s: string): string {
  return s.trim().replace(/^["'«»]|["'«»]$/g, '').trim();
}

/** Oturum cümlesini haritanın hafıza bölümüne ekler. Harita bölümüne dokunmaz.
 *
 *  Klasör bilinmiyorsa etiket HİÇ yazılmaz. Yanlış etiket ("kök dizin" gibi)
 *  bilgi değil gürültüdür: oturum kökte açılıp başka bir depoda çalışılmış
 *  olabilir ve okuyan yanılır. */
export function oturumYaz(proje: string | null, cumle: string): void {
  const icerik = oku(HARITA_YOLU);
  if (!icerik) return;                            // harita yoksa yazacak yer de yok
  const { harita, hafiza } = bolumler(icerik);
  const satir = proje ? `- ${bugun()} · ${proje} · ${cumle}` : `- ${bugun()} · ${cumle}`;
  yaz(HARITA_YOLU, birlestir(harita, ekle(hafiza, satir)));
}
