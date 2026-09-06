<h1 align="center">doguxclaude</h1>

<p align="center">
  <b>Claude Code that already knows your machine.</b><br>
  <b>Makineni zaten bilen Claude Code.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/doguxclaude"><img src="https://img.shields.io/npm/v/doguxclaude?color=a855f7&label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A522-22d3ee" alt="node">
  <img src="https://img.shields.io/badge/license-MIT-a855f7" alt="MIT">
</p>

```console
$ npm install -g doguxclaude
$ dxc
```

 ██████╗  ██╗  ██╗  ██████╗
 ██╔══██╗ ╚██╗██╔╝ ██╔════╝
 ██║  ██║  ╚███╔╝  ██║
 ██║  ██║  ██╔██╗  ██║
 ██████╔╝ ██╔╝ ██╗ ╚██████╗
 ╚═════╝  ╚═╝  ╚═╝  ╚═════╝

   dogu x claude  · depo haritası · Dogu X Vibes

 ╭──────────────────────────────────────╮
 │ ▸ 11 depo tarandı 220 ms             │
 │ + Projects/web-app yeni depo         │
 │ + Projects/api-platform yeni depo    │
 │ ~ Desktop/doguxclaude yapısı değişti │
 │ ▸ buradasın: api-platform            │
 ╰──────────────────────────────────────╯
 ✔ claude başlatılıyor 187 ms
```

Sonraki her açılış tek satır, çeyrek saniye.

---

## English

### The problem

Ask Claude Code about a repo and it goes looking. Measured in real sessions:

| Question | Tool calls | Output read | Result |
|---|---|---|---|
| "one sentence about web-app" | 3 | 10,494 B | ran `find` over the tree |
| "one sentence about api-platform" | 2 | 5,031 B | guessed `README.md`, got exit code 1 |

That repo has no `README.md`. It has `CLAUDE.md`. The agent had no way to know.

### The fix

`dxc` hands Claude Code two things and gets out of the way.

**1. A map of every git repo on your machine.** One line each. The model writes it
once, then only when folder names change. Never on a normal launch.

**2. The structure of the repo you ask about**, injected the moment you name it.
Root files listed by name, folders with their weight. Extracted from `git ls-files`
in 10 ms, never stored, never guessed.

Now the agent already knows `CLAUDE.md` is there.

### Why it is fast

**Structure is a reading, not a judgement, so code does it.** Only the one-line
description is a judgement, so the model does it, once per repo, and never again
until the folder names change.

| What | Time |
|---|---|
| Scan 11 repos, refresh map | 250 ms |
| Extract structure of a 1,120-file repo | 10 ms |
| On-demand injection hook | 95 ms |

Output does not grow with the codebase:

| Files | Lines of structure |
|---|---|
| 28 | 14 |
| 246 | 41 |
| 1,120 | 72 |

A folder is opened only if it holds at least 2% of the files. Small siblings collapse
onto one line, but **every name is written** — measured: given three examples instead
of all names, the agent ran `ls` to find the rest.

### Zero config

Nothing is written to `~/.claude/settings.json`. The hook is handed to Claude Code
per run with `--settings`, and your own settings still apply. Nothing to install,
nothing to configure, no commands to memorise. You type `dxc`.

---

## Türkçe

### Sorun

Claude Code'a bir depoyu sorduğunda aramaya çıkıyor. Gerçek oturumlarda ölçüldü:

| Soru | Araç çağrısı | Okunan çıktı | Sonuç |
|---|---|---|---|
| "web-app tek cümle" | 3 | 10.494 B | ağacı `find` ile taradı |
| "api-platform tek cümle" | 2 | 5.031 B | `README.md` tahmin etti, hata aldı |

O depoda `README.md` yok. `CLAUDE.md` var. Ajanın bunu bilmesinin yolu yoktu.

### Çözüm

`dxc` Claude Code'a iki şey verip kenara çekiliyor.

**1. Makinendeki her git deposunun haritası.** Her biri tek satır. Model bunu bir kez
yazar, sonra yalnız klasör adları değişince yeniler. Normal açılışta hiç çalışmaz.

**2. Sorduğun deponun yapısı**, adını andığın anda enjekte edilir. Kök dosyalar ada
ada, klasörler ağırlığıyla. `git ls-files` çıktısından 10 ms'de üretilir, saklanmaz,
tahmin edilmez.

Artık ajan `CLAUDE.md`'nin orada olduğunu baştan biliyor.

### Neden hızlı

**Yapı bir okumadır, yargı değil, o yüzden onu kod yapar.** Yalnız tek satırlık
açıklama yargıdır, onu model yapar, depo başına bir kez, klasör adları değişene
kadar bir daha da yapmaz.

| Ne | Süre |
|---|---|
| 11 depoyu tara, haritayı tazele | 250 ms |
| 1.120 dosyalık deponun yapısını çıkar | 10 ms |
| İstek üzerine enjeksiyon kancası | 95 ms |

Çıktı kod tabanıyla büyümez:

| Dosya | Yapı satırı |
|---|---|
| 28 | 14 |
| 246 | 41 |
| 1.120 | 72 |

Bir klasör, dosyaların en az yüzde ikisini tutuyorsa açılır. Küçük kardeşler tek
satıra toplanır ama **adların tamamı yazılır**. Ölçüldü: üç örnek verilince ajan
kalanları öğrenmek için `ls` çalıştırıyordu.

### Sıfır ayar

`~/.claude/settings.json` dosyana hiçbir şey yazılmaz. Kanca her koşuda
`--settings` ile veriliyor, senin kendi ayarların olduğu gibi kalıyor. Kurulacak
bir şey yok, yapılandırma yok, ezberlenecek komut yok. Terminale `dxc` yazıyorsun.

---

## Komutlar

```
dxc                 başlat (claude bayrakları olduğu gibi geçer)
dxc --kuru          başlatmadan, enjekte edilecek metni göster
dxc harita          haritayı yeniden üret (--zorla, --modelsiz, --goster)
dxc ozet [klasör]   bir deponun yapısını çıkar (kod, model yok)
```

## Nerede ne duruyor

| Yol | Ne | Oturuma yüklenir mi |
|---|---|---|
| `~/.doguxclaude/index.md` | harita | evet |
| `~/.doguxclaude/durum.json` | şekil parmak izleri | hayır |
| `~/.doguxclaude/oturum/` | oturumda yazılmış depolar | hayır |

Kurallar ve ölçümler: [`NE-YAPIYOR.md`](NE-YAPIYOR.md) · Tasarım notları: [`TASLAK.md`](TASLAK.md)

<p align="center">
  MIT · Doğukan Şahin · <a href="https://github.com/sdogukan">Dogu X Vibes</a>
</p>
