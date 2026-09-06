/** UserPromptSubmit kancası: oturum içinde depo değişince yapıyı verir.
 *
 *  Neden gerekli (ölçümle): açılışta enjekte edilen yapı, `dxc`'nin çalıştırıldığı
 *  klasöre aittir ve oturum boyunca sabit kalır. Kökten açılan bir oturumda ajan
 *  cozdukce'ye girince yapıyı `find` ile baştan keşfetti (3 araç çağrısı,
 *  10.494 bayt çıktı); dijji-ai'de ise olmayan README.md'yi tahmin edip hata aldı.
 *  Oysa yapı bloğu kök dosyaları ada ada sayar, CLAUDE.md orada yazılı.
 *
 *  Kural tek: aynı depodaysan hiçbir şey yazılmaz. Maliyet yalnız geçişte ödenir
 *  ve depo başına 58-647 token. Üretimi koddan, 8-11 ms.
 *
 *  Kanca hiçbir koşulda oturumu bozmamalı: her hata yutulur, çıkış kodu 0,
 *  stdout boş kalır. Boş çıktı "hiçbir şey ekleme" demektir. */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { depoBlogu } from './baglam.js';
import { iceridekiDepo } from './tarama.js';
import { KOK, oku, yaz } from './util.js';

/** dxc'nin açılışta hangi depoyu enjekte ettiği. Kanca ilk istemde aynı depoyu
 *  ikinci kez yazmasın diye ortam değişkeniyle geçirilir (spawn ile miras alınır). */
export const ACILIS_DEPO = 'DOGUXCLAUDE_ACILIS_DEPO';

const OTURUM_DIZINI = join(KOK, 'oturum');
const OMUR_GUN = 7;

/** Oturum başına son enjekte edilen depo. Oturum kimliği claude'dan gelir. */
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

export interface Karar { enjekte: string | null; depo: string | null }

/** Saf karar: girdiden ne çıkacağını söyler, hiçbir şey yazmaz. Test edilebilir. */
export function karar(cwd: string, oncekiDepo: string | null, acilisDepo: string | null): Karar {
  const depo = iceridekiDepo(cwd);
  if (!depo) return { enjekte: null, depo: null };
  // İlk istem: dxc bu depoyu zaten sistem istemine koyduysa tekrar yazma.
  if (oncekiDepo === null && acilisDepo && acilisDepo === depo) return { enjekte: null, depo };
  if (oncekiDepo === depo) return { enjekte: null, depo };
  return { enjekte: depoBlogu(depo), depo };
}

export async function kancaCalistir(): Promise<void> {
  let ham = '';
  for await (const parca of process.stdin) ham += parca;
  const g = JSON.parse(ham) as { session_id?: string; cwd?: string };
  const oturum = g.session_id ?? '';
  const cwd = g.cwd ?? process.cwd();
  if (!oturum) return;

  const yol = durumYolu(oturum);
  const onceki = oku(yol);
  const k = karar(cwd, onceki === null ? null : onceki.trim(), process.env[ACILIS_DEPO] || null);

  if (k.depo) { yaz(yol, k.depo); eskileriSil(); }
  if (!k.enjekte) return;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: k.enjekte },
  }));
}
