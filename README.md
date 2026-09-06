# doguxclaude

**Claude Code that already knows your machine.**
**Makineni zaten bilen Claude Code.**

```bash
npm install -g doguxclaude
dxc
```

Kurulum yok. Yapılandırma yok. Komut ezberi yok. Terminale `dxc` yaz.

[English](#english) · [Türkçe](#türkçe)

---

## English

`dxc` starts Claude Code with your machine already in context.

**Two things, both fast.**

1. **A map of every git repo on your machine.** One line each, written once by the
   model, refreshed only when folder names change.
2. **The structure of the repo you ask about**, injected the moment you name it.
   Extracted from code, never stored, never guessed.

**Why it is fast.** Structure is a reading, not a judgement, so code does it.
Only the one-line description is a judgement, so the model does it, once per repo.

| What | Time |
|---|---|
| Scan 11 repos, refresh map | 250 ms |
| Extract structure of a 1,120-file repo | 10 ms |
| Hook that injects on demand | 95 ms |

Output does not grow with file count:

| Repo | Files | Lines |
|---|---|---|
| small | 28 | 14 |
| medium | 246 | 41 |
| large | 1,120 | 72 |

**Zero config.** Nothing is written to `~/.claude/settings.json`. The hook is
passed to Claude Code per run with `--settings`, and your own settings still apply.

**Measured, not claimed.** In real sessions without it, one question about a repo
cost 3 tool calls and 10,494 bytes of output, and the agent guessed a `README.md`
that did not exist. The structure block lists root files by name, so it does not guess.

---

## Türkçe

`dxc`, Claude Code'u makinen zaten bağlamdayken başlatır.

**İki şey, ikisi de hızlı.**

1. **Makinendeki her git deposunun haritası.** Her biri tek satır. Modeli bir kez
   çalıştırır, sonra yalnız klasör adları değişince yeniler.
2. **Sorduğun deponun yapısı**, adını andığın anda enjekte edilir. Koddan çıkarılır,
   saklanmaz, tahmin edilmez.

**Neden hızlı.** Yapı bir okumadır, yargı değil, o yüzden onu kod yapar.
Yalnız tek satırlık açıklama yargıdır, onu model yapar, depo başına bir kez.

| Ne | Süre |
|---|---|
| 11 depoyu tara, haritayı tazele | 250 ms |
| 1.120 dosyalık deponun yapısını çıkar | 10 ms |
| Enjeksiyon kancası | 95 ms |

Çıktı dosya sayısıyla büyümez:

| Depo | Dosya | Satır |
|---|---|---|
| küçük | 28 | 14 |
| orta | 246 | 41 |
| büyük | 1.120 | 72 |

**Sıfır ayar.** `~/.claude/settings.json` dosyana hiçbir şey yazılmaz. Kanca her
koşuda `--settings` ile geçici tanıtılır, senin kendi ayarların korunur.

**İddia değil, ölçüm.** Bu olmadan gerçek oturumlarda bir depo hakkındaki tek soru
3 araç çağrısına ve 10.494 bayt çıktıya mal oldu; ajan olmayan bir `README.md`'yi
tahmin edip hata aldı. Yapı bloğu kök dosyaları ada ada yazar, o yüzden tahmin etmez.

---

## Komutlar

```
dxc                 başlat (claude bayrakları olduğu gibi geçer)
dxc --kuru          başlatmadan, enjekte edilecek metni göster
dxc harita          haritayı yeniden üret (--zorla, --modelsiz, --goster)
dxc ozet [klasör]   bir deponun yapısını çıkar (kod, model yok)
```

Kurallar ve ölçümler: [`NE-YAPIYOR.md`](NE-YAPIYOR.md). Tasarım notları: `TASLAK.md`.

MIT · Doğukan Şahin · [Dogu X Vibes](https://github.com/sdogukan)
