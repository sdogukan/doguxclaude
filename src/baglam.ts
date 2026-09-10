/** Enjekte edilen depo bloğu.
 *
 *  Aynı metin iki yerde kullanılır: açılışta (sistem istemine) ve oturum
 *  içinde depo değişince (kanca). Tek yerde durur ki ikisi ayrışmasın. */
import { basename } from 'node:path';
import { depoOzeti } from './ozet.js';
import { cogul } from './util.js';

/** Yapının nasıl kullanılacağı. Liste tek başına yönlendirmiyor: ölçüldü,
 *  ajan yapıyı elinde olduğu halde `ls` ile baştan keşfetti (6 araç çağrısı). */
export const YONERGE = [
  'The folder structure below was generated from `git ls-files` and is current.',
  'Do not run `ls`, `find` or `tree` to learn the structure; the numbers are file counts under each folder.',
  'This summary does not include file CONTENTS, line counts or function names; when you need those, read the relevant file directly.',
  'If the repo has its own CLAUDE.md it still applies: this summary does not replace it, it only removes the cost of rediscovering the structure.',
].join('\n');

export function depoBlogu(depo: string): string {
  const o = depoOzeti(depo);
  return `# This repo: ${basename(depo)}\n\n${depo} · ${cogul(o.dosyaSayisi, 'file')}\n\n${YONERGE}\n\n\`\`\`\n${o.metin}\n\`\`\``;
}
