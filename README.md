# doguxclaude

Claude Code'u makinendeki depoların haritasıyla başlatır. Terminal komutu: `dxc`.

```bash
npm install -g doguxclaude
dxc
```

Kurulum yok, yapılandırma yok, komut ezberi yok. İlk `dxc` depoları tarar ve haritayı
çıkarır (bir kez, ~38 sn). Sonraki her açılış **50 ms**.

## Ne yapıyor

Oturum başlarken iki şey enjekte edilir:

1. **Harita** — makinendeki depolar, her biri tek satır açıklamayla. `~/.doguxclaude/index.md`.
2. **Bu deponun yapısı** — bulunduğun deponun klasör ağacı, o an üretilir, saklanmaz.

## İş bölümü

"Ne var, nerede" bir okumadır, çıkarım değil → **kod** yapar.
"Ne işe yarar" bir yargıdır → **model** yapar, harita üretilirken bir kez.

Ölçüm (10 depo, 9.499 dosya, bu makine):

| Adım | Süre |
|---|---|
| Depoları bul | 9 ms |
| Yapıları çıkar | 168 ms |
| Açıklamaları yazdır (model, tek çağrı) | 39 sn |

Harita 3 KB, oturuma yüklenir. Depo yapısı istendiği an 14 ms'de üretilir.

## Algoritma

Bir deponun yapısı üç kuralla kesilir:

1. Dosya listesi `git ls-files`'tan gelir — `node_modules`, `dist` kendiliğinden düşer.
2. Bir klasör toplam dosyanın %2'sinden azını tutuyorsa içine inilmez.
3. Yan yana 4'ten fazla küçük klasör tek satıra toplanır.

Sonuç dosya sayısıyla büyümez: 7.466 dosyalık depo 85 satır, 1.120 dosyalık depo 72 satır.

## Komutlar

```
dxc                 başlat (claude bayrakları olduğu gibi geçer)
dxc --kuru          başlatmadan, enjekte edilecek metni göster
dxc harita          haritayı yeniden üret (--modelsiz, --goster)
dxc ozet [klasör]   bir deponun yapısını çıkar (kod, model yok)
```

Tasarım notları: `TASLAK.md`. Lisans: MIT, Doğukan Şahin.
