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
import { calisiyor, satir, son, sure, tik, vurgu } from './ekran.js';
import { depoOzeti } from './ozet.js';
import { Depo, depoBilgisi, depolariBul } from './tarama.js';
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
}

/** Depoları tarar, haritayı gerekiyorsa tazeler. `zorla` ile tüm açıklamalar yeniden yazdırılır. */
export function haritaTazele(secenek: { zorla?: boolean; modelsiz?: boolean; sessiz?: boolean } = {}): TazelemeSonucu {
  const t0 = Date.now();
  const ev = homedir();
  const depolar = depolariBul(ev).map((y) => depoBilgisi(y, ev));
  const ozetler = new Map(depolar.map((d) => [d.goreli, depoOzeti(d.yol)]));
  depolar.sort((a, b) => (b.sonDegisiklik || '').localeCompare(a.sonDegisiklik || ''));
  const kodMs = Date.now() - t0;

  const eski = mevcutAciklamalar();
  const suAnki = new Set(depolar.map((d) => d.goreli));
  const yeni = secenek.zorla ? depolar.map((d) => d.goreli) : depolar.filter((d) => !eski.has(d.goreli)).map((d) => d.goreli);
  const dusen = [...eski.keys()].filter((k) => !suAnki.has(k));
  const degisti = yeni.length > 0 || dusen.length > 0 || !oku(HARITA_YOLU);

  if (!secenek.sessiz) {
    satir(`${depolar.length} depo ${sure(kodMs)}`);
    for (const d of dusen) satir(`${vurgu(d)} artık yok, haritadan düştü`);
  }

  let modelMs = 0;
  let uretilen: Map<string, string> | null = null;
  if (yeni.length && !secenek.modelsiz) {
    const girdi = depolar.filter((d) => yeni.includes(d.goreli)).map((d) => {
      const o = ozetler.get(d.goreli)!;
      return `## ${d.goreli}\n${o.dosyaSayisi} dosya · son değişiklik ${d.sonDegisiklik}\n\`\`\`\n${o.metin}\n\`\`\``;
    }).join('\n\n');
    const bitir = secenek.sessiz ? () => {}
      : calisiyor(`${yeni.length} depo için açıklama yazılıyor${yeni.length <= 3 ? `: ${yeni.join(', ')}` : ''}`);
    const t1 = Date.now();
    uretilen = aciklamalariUret(girdi);
    modelMs = Date.now() - t1;
    bitir(uretilen ? `${tik()} ${yeni.length} açıklama ${sure(modelMs)}` : `açıklama üretilemedi ${sure(modelMs)}`);
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
  return { depolar, yeni, dusen, degisti, kodMs, modelMs };
}

function haritaMetni(satirlar: HaritaSatiri[]): string {
  const bas = ['# Harita', '', `${satirlar.length} depo · ${bugun()} · yapı koddan, açıklamalar modelden`,
    '', 'Klasör yapısı burada tutulmaz; klasöre girilince o an üretilir.', ''];
  const govde = satirlar.map((s) =>
    `- **${s.goreli}** — ${s.aciklama || '(açıklama yok)'}\n  <sub>${s.dosya} dosya · ${s.sonDegisiklik || 'tarih yok'}</sub>`);
  return [...bas, ...govde, ''].join('\n');
}

export function haritaOku(): string | null { return oku(HARITA_YOLU); }
export { son };
