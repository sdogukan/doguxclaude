/** Harita üretimi ve tazeleme.
 *
 *  İş bölümü: "ne var, nerede" okumadır → kod (9 ms tarama, 168 ms özet).
 *  "Ne işe yarar" yargıdır → model, yalnız açıklaması olmayan depolar için.
 *
 *  Tazeleme artımlıdır: her açılışta depolar taranır (9 ms, bedava), haritadaki
 *  listeyle karşılaştırılır. Yeni depo varsa yalnız onun açıklaması yazdırılır;
 *  var olanlara dokunulmaz. Silinen depo haritadan düşer. */
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { banner, bekle, calisiyor, kutuBas, ok, satir, sure, tik, uyari, vurgu } from './ekran.js';
import { depoOzeti } from './ozet.js';
import { Depo, depoBilgisi, depolariBul } from './tarama.js';
import { durumOku, durumYaz, sekilIzi } from './durum.js';
import { bugun, HARITA_YOLU, oku, yaz } from './util.js';

export interface HaritaSatiri { goreli: string; aciklama: string; dosya: number; sonDegisiklik: string }

const ISTEM = `Aşağıda bir makinedeki git depolarının klasör yapısı var. Yapı koddan çıkarıldı: her klasörün yanındaki sayı o klasörün altındaki dosya sayısıdır, küçük klasörler tek satıra toplanmıştır.

Her depo için TEK satır yaz: bu depo ne işi yapıyor. Sadece klasör ve dosya adlarından çıkarabildiğin kadarını yaz. Emin olmadığın yeri "belirsiz" de, UYDURMA.

Biçim, tam olarak:
- <depo yolu> — <tek cümle>

Başka hiçbir şey yazma: giriş cümlesi yok, başlık yok, sonuç yok.`;

/** Modeli bir kez çağırır. Başarısızsa null; harita yine yazılır, açıklama boş kalır. */
function aciklamalariUret(girdi: string, zamanAsimiMs = 300_000): Map<string, string> | null {
  const r = spawnSync('claude', ['-p'], {
    input: `${ISTEM}\n\n${girdi}`, encoding: 'utf8', timeout: zamanAsimiMs, maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0 || !r.stdout) return null;
  const harita = new Map<string, string>();
  for (const s of r.stdout.split('\n')) {
    const m = /^\s*-\s+(.+?)\s+—\s+(.+?)\s*$/.exec(s);
    if (m) harita.set(m[1]!.replace(/[`*]/g, '').trim(), m[2]!.trim());
  }
  return harita.size ? harita : null;
}

/** Var olan haritadan açıklamaları okur; artımlı tazelemede korunurlar. */
export function mevcutAciklamalar(): Map<string, string> {
  const harita = new Map<string, string>();
  const icerik = oku(HARITA_YOLU);
  if (!icerik) return harita;
  for (const s of icerik.split('\n')) {
    const m = /^-\s+\*\*(.+?)\*\*\s+—\s+(.+?)\s*$/.exec(s);
    if (m && m[2] !== '(açıklama yok)') harita.set(m[1]!, m[2]!);
  }
  return harita;
}

export interface TazelemeSonucu {
  depolar: Depo[];
  yeni: string[];
  dusen: string[];
  degisti: boolean;
  kodMs: number;
  modelMs: number;
  /** Gerçek iş yapıldı mı: banner ve kutu yalnız bu doğruysa gösterilir. */
  isVar: boolean;
}

/** Depoları tarar, haritayı gerekiyorsa tazeler. `zorla` ile tüm açıklamalar yeniden yazdırılır. */
export async function haritaTazele(
  secenek: { zorla?: boolean; modelsiz?: boolean; sessiz?: boolean; ekSatir?: string } = {},
): Promise<TazelemeSonucu> {
  const t0 = Date.now();
  const ev = homedir();
  const depolar = depolariBul(ev).map((y) => depoBilgisi(y, ev));
  const ozetler = new Map(depolar.map((d) => [d.goreli, depoOzeti(d.yol)]));
  depolar.sort((a, b) => (b.sonDegisiklik || '').localeCompare(a.sonDegisiklik || ''));
  const kodMs = Date.now() - t0;

  const eski = mevcutAciklamalar();
  const durum = durumOku();
  const suAnki = new Set(depolar.map((d) => d.goreli));

  // Açıklama neye dayanır: klasör ADLARINA. Ad ağacı değişmediyse açıklama hâlâ
  // geçerlidir; dosya sayısının değişmesi deponun ne iş yaptığını değiştirmez.
  const izler = new Map(depolar.map((d) => [d.goreli, sekilIzi(ozetler.get(d.goreli)!.metin)]));
  const yeniDepo = depolar.filter((d) => !eski.has(d.goreli)).map((d) => d.goreli);
  const sekliDegisen = depolar
    .filter((d) => eski.has(d.goreli) && durum.depolar[d.goreli]?.sekil !== izler.get(d.goreli))
    .map((d) => d.goreli);
  const yeni = secenek.zorla ? depolar.map((d) => d.goreli) : [...yeniDepo, ...sekliDegisen];
  const dusen = [...eski.keys()].filter((k) => !suAnki.has(k));
  // Sayı ve tarih bedava hesaplanıyor; harita her açılışta yazılır ki bayatlamasın.
  const degisti = true;

  const isVar = yeni.length > 0 || dusen.length > 0;
  // Banner iş olduğu anlaşılınca, model çağrısından ÖNCE basılır: yoksa
  // dönen gösterge banner'dan önce ekrana düşüyor.
  if (!secenek.sessiz && isVar) await banner();
  if (!secenek.sessiz) {
    satir(`${ok()} ${vurgu(String(depolar.length))} depo tarandı ${sure(kodMs)}`);
    for (const d of dusen) satir(`${uyari('−')} ${d} artık yok, haritadan düştü`);
    for (const d of sekliDegisen) satir(`${uyari('~')} ${vurgu(d)} yapısı değişti`);
    for (const d of yeniDepo) satir(`${uyari('+')} ${vurgu(d)} yeni depo`);
  }

  // Kutu, model çağrısından ÖNCE basılır: kullanıcı beklerken ne olduğunu görsün.
  if (!secenek.sessiz) {
    if (secenek.ekSatir) satir(secenek.ekSatir);
    kutuBas();
  }

  let modelMs = 0;
  let uretilen: Map<string, string> | null = null;
  if (yeni.length && !secenek.modelsiz) {
    const girdi = depolar.filter((d) => yeni.includes(d.goreli)).map((d) => {
      const o = ozetler.get(d.goreli)!;
      return `## ${d.goreli}\n${o.dosyaSayisi} dosya · son değişiklik ${d.sonDegisiklik}\n\`\`\`\n${o.metin}\n\`\`\``;
    }).join('\n\n');
    if (!secenek.sessiz) bekle(`${yeni.length} depo için açıklama yazılacak, ${yeni.length * 8} sn sürebilir`);
    const bitir = secenek.sessiz ? () => {}
      : calisiyor(`${yeni.length} açıklama yazılıyor`, yeni.length * 8);
    const t1 = Date.now();
    uretilen = aciklamalariUret(girdi);
    modelMs = Date.now() - t1;
    bitir(uretilen ? `${tik()} ${yeni.length} açıklama yazıldı ${sure(modelMs)}` : `${uyari('✗')} açıklama üretilemedi ${sure(modelMs)}`);
  }

  if (degisti) {
    const satirlar: HaritaSatiri[] = depolar.map((d) => ({
      goreli: d.goreli,
      aciklama: uretilen?.get(d.goreli) ?? eski.get(d.goreli) ?? '',
      dosya: ozetler.get(d.goreli)!.dosyaSayisi,
      sonDegisiklik: d.sonDegisiklik,
    }));
    yaz(HARITA_YOLU, haritaMetni(satirlar));
  }
  // Parmak izleri ayrı dosyada: index.md her oturuma yükleniyor, makine verisi oraya girmez.
  durumYaz({ surum: 1, depolar: Object.fromEntries(depolar.map((d) => [d.goreli, { sekil: izler.get(d.goreli)! }])) });
  return { depolar, yeni, dusen, degisti, kodMs, modelMs, isVar };
}

function haritaMetni(satirlar: HaritaSatiri[]): string {
  const bas = ['# Harita', '', `${satirlar.length} depo · ${bugun()} · yapı koddan, açıklamalar modelden`,
    '', 'Klasör yapısı burada tutulmaz; klasöre girilince o an üretilir.', ''];
  const govde = satirlar.map((s) =>
    `- **${s.goreli}** — ${s.aciklama || '(açıklama yok)'}\n  <sub>${s.dosya} dosya · ${s.sonDegisiklik || 'tarih yok'}</sub>`);
  return [...bas, ...govde, ''].join('\n');
}

export function haritaOku(): string | null { return oku(HARITA_YOLU); }
