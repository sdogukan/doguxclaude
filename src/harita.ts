/** Harita üretimi: yapıyı kod çıkarır, tek satırlık açıklamaları model yazar.
 *
 *  İş bölümü: "ne var, nerede" okumadır → kod. "Ne işe yarar" yargıdır → model, tek çağrı.
 *  Ölçüldü: kod 177 ms, model 37 sn (10 depo, 9.499 dosya). */
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { Depo, depoBilgisi, depolariBul } from './tarama.js';
import { depoOzeti } from './ozet.js';
import { bugun, HARITA_YOLU, oku, yaz } from './util.js';

export interface HaritaSatiri { goreli: string; aciklama: string; dosya: number; sonDegisiklik: string; }

const ISTEM = `Aşağıda bir makinedeki git depolarının klasör yapısı var. Yapı koddan çıkarıldı: her klasörün yanındaki sayı o klasörün altındaki dosya sayısıdır, küçük klasörler tek satıra toplanmıştır.

Her depo için TEK satır yaz: bu depo ne işi yapıyor. Sadece klasör ve dosya adlarından çıkarabildiğin kadarını yaz. Emin olmadığın yeri "belirsiz" de, UYDURMA.

Biçim, tam olarak:
- <depo yolu> — <tek cümle>

Başka hiçbir şey yazma: giriş cümlesi yok, başlık yok, sonuç yok.`;

/** Modeli bir kez çağırır. Başarısızsa null döner; harita yine üretilir, açıklamalar boş kalır. */
export function aciklamalariUret(girdi: string, zamanAsimiMs = 300_000): Map<string, string> | null {
  const r = spawnSync('claude', ['-p'], {
    input: `${ISTEM}\n\n${girdi}`,
    encoding: 'utf8',
    timeout: zamanAsimiMs,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0 || !r.stdout) return null;
  const harita = new Map<string, string>();
  for (const satir of r.stdout.split('\n')) {
    const m = /^\s*-\s+(.+?)\s+—\s+(.+?)\s*$/.exec(satir);
    if (m) harita.set(m[1]!.replace(/[`*]/g, '').trim(), m[2]!.trim());
  }
  return harita.size ? harita : null;
}

export interface HaritaSonucu {
  depolar: Depo[];
  satirlar: HaritaSatiri[];
  kodMs: number;
  modelMs: number;
  modelCalisti: boolean;
}

export function haritaUret(secenek: { modelsiz?: boolean } = {}): HaritaSonucu {
  const t0 = Date.now();
  const ev = homedir();
  const yollar = depolariBul(ev);
  const depolar = yollar.map((y) => depoBilgisi(y, ev));
  const ozetler = new Map<string, ReturnType<typeof depoOzeti>>();
  for (const d of depolar) ozetler.set(d.goreli, depoOzeti(d.yol));
  depolar.sort((a, b) => (b.sonDegisiklik || '').localeCompare(a.sonDegisiklik || ''));
  const kodMs = Date.now() - t0;

  const girdi = depolar.map((d) => {
    const o = ozetler.get(d.goreli)!;
    return `## ${d.goreli}\n${o.dosyaSayisi} dosya · son değişiklik ${d.sonDegisiklik}\n\`\`\`\n${o.metin}\n\`\`\``;
  }).join('\n\n');

  const t1 = Date.now();
  const aciklamalar = secenek.modelsiz ? null : aciklamalariUret(girdi);
  const modelMs = Date.now() - t1;

  const satirlar: HaritaSatiri[] = depolar.map((d) => ({
    goreli: d.goreli,
    aciklama: aciklamalar?.get(d.goreli) ?? '',
    dosya: ozetler.get(d.goreli)!.dosyaSayisi,
    sonDegisiklik: d.sonDegisiklik,
  }));

  yaz(HARITA_YOLU, haritaMetni(satirlar, kodMs, modelMs, Boolean(aciklamalar)));
  return { depolar, satirlar, kodMs, modelMs, modelCalisti: Boolean(aciklamalar) };
}

function haritaMetni(satirlar: HaritaSatiri[], kodMs: number, modelMs: number, modelCalisti: boolean): string {
  const bas = [
    '# Harita', '',
    `${satirlar.length} depo · ${bugun()} · yapı koddan (${kodMs} ms)` +
      (modelCalisti ? `, açıklamalar modelden (${(modelMs / 1000).toFixed(0)} sn)` : ', açıklama yok (model çalışmadı)'),
    '', 'Klasör yapısı burada tutulmaz; klasöre girilince o an üretilir (`dxc ozet`).', '',
  ];
  const govde = satirlar.map((s) =>
    `- **${s.goreli}** — ${s.aciklama || '(açıklama yok)'}\n  <sub>${s.dosya} dosya · ${s.sonDegisiklik || 'tarih yok'}</sub>`);
  return [...bas, ...govde, ''].join('\n');
}

export function haritaOku(): string | null { return oku(HARITA_YOLU); }
