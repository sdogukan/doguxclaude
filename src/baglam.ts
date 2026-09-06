/** Enjekte edilen depo bloğu.
 *
 *  Aynı metin iki yerde kullanılır: açılışta (sistem istemine) ve oturum
 *  içinde depo değişince (kanca). Tek yerde durur ki ikisi ayrışmasın. */
import { basename } from 'node:path';
import { depoOzeti } from './ozet.js';

/** Yapının nasıl kullanılacağı. Liste tek başına yönlendirmiyor: ölçüldü,
 *  ajan yapıyı elinde olduğu halde `ls` ile baştan keşfetti (6 araç çağrısı). */
export const YONERGE = [
  'Aşağıdaki klasör yapısı `git ls-files` çıktısından üretildi ve günceldir.',
  'Yapıyı öğrenmek için `ls`, `find`, `tree` çalıştırma; sayılar klasörün altındaki dosya sayısıdır.',
  'Bu özet dosya İÇERİĞİNİ, satır sayılarını ve fonksiyon adlarını içermez; onlar gerekiyorsa doğrudan ilgili dosyayı oku.',
  'Deponun kendi CLAUDE.md dosyası varsa geçerliliğini korur: bu özet onun yerine geçmez, yalnız yapıyı tekrar keşfetme yükünü kaldırır.',
].join('\n');

export function depoBlogu(depo: string): string {
  const o = depoOzeti(depo);
  return `# Bu depo: ${basename(depo)}\n\n${depo} · ${o.dosyaSayisi} dosya\n\n${YONERGE}\n\n\`\`\`\n${o.metin}\n\`\`\``;
}
