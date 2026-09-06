/** İç durum dosyası: depo başına "şekil parmak izi".
 *
 *  Neden ayrı dosya: `index.md` her oturuma yükleniyor; parmak izleri makine verisi,
 *  insan da model de okumaz. Oraya koymak boşuna token harcamak olur.
 *
 *  Parmak izi neyin özeti: klasör adları, sayılar HARİÇ. Açıklama cümlesi
 *  "bu depo ne iş yapıyor" der ve bunu klasör ADLARINDAN çıkarır; dosya sayıları
 *  yalnız neyin gösterileceğini seçer. Yani ad ağacı değişmediyse açıklama geçerlidir. */
import { createHash } from 'node:crypto';
import { DURUM_YOLU, oku, yaz } from './util.js';

export interface Durum { surum: 1; depolar: Record<string, { sekil: string }> }

const BOS: Durum = { surum: 1, depolar: {} };

export function durumOku(): Durum {
  const ham = oku(DURUM_YOLU);
  if (!ham) return { ...BOS, depolar: {} };
  try {
    const d = JSON.parse(ham) as Durum;
    return d && d.surum === 1 && d.depolar ? d : { ...BOS, depolar: {} };
  } catch { return { ...BOS, depolar: {} }; }   // bozuk dosya işi durdurmaz
}

export function durumYaz(d: Durum): void {
  yaz(DURUM_YOLU, JSON.stringify(d, null, 2) + '\n');
}

/** Özet metninden sayıları atıp kalan ad ağacının özetini alır.
 *  `services/  (132)` ile `services/  (145)` aynı parmak izini verir. */
export function sekilIzi(ozetMetni: string): string {
  const adlar = ozetMetni
    .replace(/\s*\(\d+\)/g, '')                       // klasör sayıları
    .replace(/…\s*\d+ klasör \(\d+ dosya\):/g, '…:')  // toplama satırındaki sayılar
    .trim();
  return createHash('sha256').update(adlar, 'utf8').digest('hex').slice(0, 16);
}
