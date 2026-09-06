/** Terminal arayüzü.
 *  Ürün adı: dogu x claude (dxc). Yapımcı: Dogu X Vibes.
 *
 *  İki kip: iş yoksa tek satır (0,2 sn'lik koşuyu boğmamak için), iş varsa
 *  tam gösteri (banner, kutu, ilerleme çubuğu). Her şey stderr'e gider;
 *  stdout claude'un. TTY değilse ya da NO_COLOR varsa düz metne düşer. */
import boxen from 'boxen';
import cfonts from 'cfonts';
import gradient from 'gradient-string';
import ora, { type Ora } from 'ora';

const TTY = process.stderr.isTTY === true && !process.env['NO_COLOR'];
const MOR_CAM = ['#a855f7', '#22d3ee'] as const;
const gecis = TTY ? gradient(MOR_CAM as unknown as string[]) : (s: string) => s;

const e = (k: string) => (TTY ? `\x1b[${k}m` : '');
const R = e('0');
const KALIN = e('1');
const SOLUK = e('2');
const CAM = e('38;5;44');
const YESIL = e('38;5;84');
const SARI = e('38;5;221');
const GRI = e('38;5;245');

export function vurgu(s: string): string { return `${KALIN}${CAM}${s}${R}`; }
export function tik(): string { return `${YESIL}✔${R}`; }
export function ok(): string { return `${CAM}▸${R}`; }
export function uyari(s: string): string { return `${SARI}${s}${R}`; }
export function sure(ms: number): string {
  return `${SOLUK}${GRI}${ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} sn`}${R}`;
}

/** Renk çarkı: dalga animasyonunda gradyan durakları buradan kaydırılır. */
const CARK = ['#a855f7', '#c026d3', '#e11d48', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];

function carktanGradyan(kaydir: number): (s: string) => string {
  const n = CARK.length;
  const duraklar = [0, 1, 2, 3].map((i) => CARK[(kaydir + i * 2) % n]!);
  return gradient(duraklar);
}

/** Büyük banner, gradyan dalgasıyla canlandırılır. Yalnız gerçek iş varken;
 *  hızlı koşu tek satırla geçer. Animasyon ~700 ms, iş zaten saniyeler sürüyor. */
export async function banner(): Promise<void> {
  if (!TTY) { process.stderr.write('dxc — dogu x claude · depo haritası\n'); return; }

  // Ham ASCII'yi bir kez üret, her karede kendimiz renklendirelim.
  const cizim = cfonts.render('dxc', { font: 'block', align: 'left', space: false, colors: ['white'] });
  const ham: string[] = cizim === false ? [] : cizim.array;
  const satirlar = ham.map((s) => s.replace(/\x1b\[[0-9;]*m/g, ''));
  if (!satirlar.length) { cfonts.say('dxc', { font: 'block', gradient: MOR_CAM as unknown as string[], space: false }); return; }

  const yaz = (kaydir: number, ilk: boolean) => {
    const g = carktanGradyan(kaydir);
    if (!ilk) process.stderr.write(`\x1b[${satirlar.length}A`);
    for (const s of satirlar) process.stderr.write(`\r\x1b[K${g(s)}\n`);
  };

  process.stderr.write('\x1b[?25l');           // imleci gizle
  for (let k = 0; k < 14; k++) {
    yaz(k, k === 0);
    await new Promise((c) => setTimeout(c, 50));
  }
  yaz(0, false);                                 // son karede mor→cam sabit
  process.stderr.write('\x1b[?25h');           // imleci geri getir
  process.stderr.write(`   ${gecis('dogu x claude')}  ${SOLUK}${GRI}· depo haritası · Dogu X Vibes${R}\n\n`);
}

/** Tek satırlık başlık: değişiklik yokken kullanılır. */
export function kisaBaslik(ozet: string, ms: number): void {
  if (!TTY) { process.stderr.write(`dxc — ${ozet}\n`); return; }
  process.stderr.write(`\n ${gecis('▰▰▱ dxc')} ${SOLUK}${GRI}·${R} ${ozet} ${sure(ms)}\n\n`);
}

const satirlar: string[] = [];
export function satir(metin: string): void { satirlar.push(metin); }

/** Biriken satırları çerçeveli kutuda basar. */
export function kutuBas(): void {
  if (!satirlar.length) return;
  const icerik = satirlar.join('\n');
  satirlar.length = 0;
  if (!TTY) { process.stderr.write(icerik + '\n'); return; }
  process.stderr.write(boxen(icerik, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 1, right: 0 },
    borderStyle: 'round', borderColor: '#a855f7', dimBorder: true,
  }) + '\n');
}

export function son(metin: string): void {
  process.stderr.write(` ${metin}\n\n`);
}

export function bekle(metin: string): void {
  satir(`${uyari('⏳')} ${metin}`);
  satir(`   ${SOLUK}${GRI}bu sırada yazma — tuşlar oturuma gider${R}`);
}

/** Dönen gösterge + dolan çubuk. Dönen fonksiyon işi bitirir. */
export function calisiyor(metin: string, tahminSn = 10): (sonMetin?: string) => void {
  if (!TTY) {
    process.stderr.write(` ${metin}\n`);
    return (s) => { if (s) process.stderr.write(` ${s}\n`); };
  }
  const t0 = Date.now();
  const donen: Ora = ora({ text: metin, spinner: 'dots12', stream: process.stderr, color: 'magenta' }).start();
  const z = setInterval(() => {
    const gecen = (Date.now() - t0) / 1000;
    const oran = Math.min(0.97, gecen / tahminSn);
    const dolu = Math.round(oran * 16);
    const cubuk = gecis('▰'.repeat(dolu)) + `${SOLUK}${GRI}${'▱'.repeat(16 - dolu)}${R}`;
    donen.text = `${cubuk}  ${metin} ${SOLUK}${GRI}${gecen.toFixed(0)} sn${R}`;
  }, 90);
  return (sonMetin) => {
    clearInterval(z);
    donen.stop();
    if (sonMetin) process.stderr.write(` ${sonMetin}\n`);
  };
}

/** Bekleme sırasında basılan tuşları claude'a sızmadan temizler. */
export function stdinBosalt(): number {
  const g = process.stdin;
  if (!g.isTTY || typeof g.setRawMode !== 'function') return 0;
  let atilan = 0;
  try {
    g.setRawMode(true);
    g.resume();
    for (;;) {
      const parca: unknown = g.read();
      if (parca === null) break;
      atilan += typeof parca === 'string' ? parca.length : (parca as Buffer).length;
    }
  } catch { /* raw mode yoksa sorun değil */ }
  finally { try { g.setRawMode(false); g.pause(); } catch { /* yok */ } }
  return atilan;
}
