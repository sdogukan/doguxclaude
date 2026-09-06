/** Terminal çıktısı. Her şey stderr'e gider; stdout Claude'un.
 *  Boru hattına yönlendirilmişse ya da NO_COLOR varsa süsler kapanır. */
const TTY = process.stderr.isTTY === true && !process.env['NO_COLOR'];

const R = TTY ? '\x1b[0m' : '';
const SOLUK = TTY ? '\x1b[2m' : '';
const KALIN = TTY ? '\x1b[1m' : '';
const MOR = TTY ? '\x1b[35m' : '';
const YESIL = TTY ? '\x1b[32m' : '';

const DONEN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function baslik(): void {
  process.stderr.write(`${MOR}${KALIN}dxc${R} ${SOLUK}— depo haritası${R}\n`);
}

export function satir(metin: string): void {
  process.stderr.write(`${SOLUK}│${R} ${metin}\n`);
}

export function son(metin: string): void {
  process.stderr.write(`${SOLUK}└${R} ${metin}\n`);
}

export function sure(ms: number): string {
  return `${SOLUK}${ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} sn`}${R}`;
}

export function vurgu(metin: string): string { return `${KALIN}${metin}${R}`; }
export function tik(): string { return `${YESIL}✓${R}`; }

/** Uzun süren iş için dönen gösterge. Dönen fonksiyon işi bitirir. */
export function calisiyor(metin: string): (sonMetin?: string) => void {
  if (!TTY) {
    process.stderr.write(`${SOLUK}│${R} ${metin}\n`);
    return (s) => { if (s) process.stderr.write(`${SOLUK}│${R} ${s}\n`); };
  }
  let i = 0;
  const t0 = Date.now();
  const yaz = () => {
    process.stderr.write(`\r${SOLUK}│${R} ${MOR}${DONEN[i++ % DONEN.length]}${R} ${metin} ${SOLUK}${((Date.now() - t0) / 1000).toFixed(0)} sn${R}   `);
  };
  yaz();
  const zamanlayici = setInterval(yaz, 90);
  return (sonMetin) => {
    clearInterval(zamanlayici);
    process.stderr.write('\r\x1b[2K');
    if (sonMetin) process.stderr.write(`${SOLUK}│${R} ${sonMetin}\n`);
  };
}
