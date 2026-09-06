# Taslak

**Bu bir taslaktır, plan değildir.** Tartışmak için yazıldı; üstünde anlaşılan maddeler `PLAN.md`'ye geçer. Bu belgedeki hiçbir madde onaylanmış sayılmaz.

## Tek vaat

> Bir klasörde çalışırım, oturumu kapatırım, yarın yeni oturum açarım, hatırlar.

Ürünün tamamı bu cümledir. Bu çalışmıyorsa gerisi anlamsız; çalışıyorsa gerisi süstür.

## Bugün ne öğrendik (kanıtla)

Çalıştığı ölçülen şeyler:

| Ne | Kanıt |
|---|---|
| Sistem mesajına metin enjekte etmek | `--append-system-prompt-file` ile denendi, ajan yalnız bloktan cevaplanabilecek soruyu doğru cevapladı |
| Hook'ların gerçekten engellemesi | Ajanın `find` ve özyinelemeli `ls` çağrıları reddedildi, kendi push komutum da engellendi |
| tree-sitter ile kod çıkarımı | 30 dosya 50 ms, dosya başına 1,7 ms; fonksiyon adı, parametre, satır aralığı doğru |
| Hafıza sayfası ve harita üretimi | Sayfa açıldı, harita koddan üretildi, kapsayıcı klasörlerde açılmadı |

Çalışmayan tek şey: **oturum kapanınca hafızanın işlenmesi.** Kuyruğa yazılıyor, kuyruğu kimse çalıştırmıyor. Bu yüzden günlük boş kalıyor, sayfa "henüz konuşulmadı" diyor.

Yani tek vaat tam olarak bir yerde kırık.

## Neden tıkandık

Tasarımla inşayı aynı anda yaptık. Her test bir tasarım kararını çürüttü, kod yeniden yazıldı. Çekirdek metni iki kez, komut yüzeyi üç kez yazıldı. Hiçbir döngü sonuna kadar kapatılmadan yeni parça eklendi.

Sorumluluk yazan tarafta: "basitleştir" denildiği halde her turda bir şey daha eklendi.

## Bundan sonraki kural

1. **Aşama bitmeden yeni parça yok.** Bir aşamanın başarı ölçütü geçmeden sonraki aşamaya geçilmez.
2. **Başarı ölçütünü sahip test eder.** Yazan taraf "çalışıyor" diyemez; sahibin kendi terminalinde görmesi gerekir.
3. **Soyut tasarım yok.** Bir şey tartışılacaksa önce en küçük hali yazılır ve denenir.
4. **Eksik olan gizlenmez.** Çalışmayan şey açıkça söylenir, üstü örtülmez.

## Aşamalar

### Aşama 1 — En küçük hatırlayan sistem

**Ne yapar:** `dxc` çalıştırılır, hafızadaki proje sayfası varsa okunup sisteme eklenir, claude başlar. Oturum bitince bir model geçişi sayfayı günceller.

**Ne YOK:** Katman 1, tree-sitter, klasör tarama, PreToolUse hook, lint, numaralı kayıtlar, çekirdek kural metni, komut yüzeyi. Hiçbiri.

**Kaç parça:** Üç. (1) `dxc` başlatıcı, (2) hafıza sayfası okuma/yazma, (3) oturum sonu Stop hook'u ile tetiklenen güncelleme.

**Başarı ölçütü (sahip test eder):**
- Bir klasörde `dxc` ile oturum aç, somut bir şey konuş ("bu projede X'e karar verdik").
- Oturumu kapat.
- Yeni oturum aç, "ne konuşmuştuk?" de.
- Doğru cevaplıyorsa aşama geçer. Cevaplamıyorsa aynı aşamada kalınır.

### Aşama 2 — Bir hafta kullanım

**Ne yapar:** Hiçbir şey eklenmez. Sahip normal işlerinde kullanır.

**Çıktı:** Neyin eksik olduğunu kullanım söyler, yazan taraf değil. Eksikler bir listeye yazılır, hiçbiri hemen yapılmaz.

**Başarı ölçütü:** Bir hafta boyunca sistem işi engellemedi ve en az bir kez gerçekten işe yaradı.

### Aşama 3 — Listeden tek madde

**Ne yapar:** Aşama 2'nin listesinden **en çok acıtan tek madde** yapılır. Muhtemel adaylar bugünden biliniyor ama karar kullanımın: klasör özeti (Katman 1), tehlikeli komut engeli, numaralı kayıtlar.

**Başarı ölçütü:** O maddenin çözdüğü acı bir daha yaşanmıyor.

Sonrası yine Aşama 2'ye döner: kullan, listele, tek madde.

## Bugünkü işten ne saklıyoruz

Hepsi git geçmişinde, silinmedi:

| Commit | İçerik |
|---|---|
| `f6213ed` | Tam çalışan sürüm: Katman 1 (tree-sitter, 35 dil), hook'lar, hafıza, 210 test |
| `2bb4b07` | Sadeleştirilmiş komut yüzeyi, `dxc` |
| `d6beb24` | Kayıt/durum/lint katmanı, 17 lint kuralı |
| `0ef500b` | Çekirdek metin damıtması ve araç gereksinimleri (116 madde) |

Aşama 1 sıfırdan yazılacak, ama bu commit'lerden parça alınabilir. Alınan her parça gerekçesiyle alınır, "vardı diye" değil.

## Açık soru

Aşama 1'de hafıza nerede dursun: kullanıcıya özel tek yerde (`~/.doguxclaude/`) mi, yoksa her projenin kendi içinde mi? Bugünkü sürüm birincisini seçmişti. Aşama 1'de karar verilecek, ikisi de denenebilir.

## Karar 1 — Proje nedir (ölçümle)

**Karar: git deposu = proje.** Sahip onayladı.

Ölçüm (bu makine, 1.923.324 dosya/klasör):

| Yöntem | Sonuç | Süre | Boyut |
|---|---|---|---|
| Her şeyi listele | 1.923.324 satır | 6,6 sn | 273 MB |
| Katlanabilir tam ağaç | 253.179 klasör | 22,9 sn | 103 MB |
| Katlanabilir süzülmüş ağaç | 14.080 klasör | 0,9 sn | 2,9 MB |
| **Git depoları (ham)** | **101** | 6,6 sn | 8 KB |
| Git depoları (süzülmüş) | 10 | 4 ms | 238 bayt |
| Erken duran çok sinyalli tarayıcı | 11 | 4 ms | 470 bayt |

101'den 10'a düşüren iki kural:
1. Nokta ile başlayan klasörlere girme (`.araclar`, `.claude`, `.codex` araç üretimi depolar tutuyor).
2. Bir depo bulunca içine inme (`Projects/data-service/rust-harness/target/ans-wd` bir derleme çıktısı).

**Açık soru:** `browser-farm` klasörünün `.git`'i yok, `package.json`'ı var. Yalnız git'e bakarsak kaçırıyoruz. `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml` gibi manifest dosyaları da sinyal sayılsın mı?

**Neden bu katman gerekli:** 470 bayt her oturuma yüklenebilir ve 4 ms'de yeniden üretilir. Kaydetmeye bile gerek yok, bayatlama diye bir şey olmaz.

## Karar 2 — Bir deponun içi nasıl özetlenir (ağırlığa göre kesme)

**Karar:** Hive haritasını (`index.md`) bu algoritma üretir. Model çalışmaz, saf kod.

### Üç kural

1. **Hangi dosyalar sayılır: git'e sor.** `git ls-files` yalnız izlenen dosyaları verir; `node_modules`, `dist`, `target` kendiliğinden düşer. Ayrı süzgeç listesi yazılmaz, bakımı da gerekmez.
2. **Küçük klasörü açma.** Her klasörün altındaki toplam dosya sayısı = ağırlığı. Ağırlığı toplamın **%2**'sinden azsa içine inilmez; yalnız adı ve sayısı yazılır. (Eşik: `max(3, toplam/50)`.)
3. **Çok sayıda küçük kardeşi tek satıra topla.** Yan yana **4**'ten fazla küçük klasör varsa tek tek yazılmaz:
   `… 27 klasör daha (52 dosya): task-dispatcher, audit, auth…`

### Neden sabit derinlik değil

Bir projede önemli şey 2. seviyede, başkasında 5. seviyede olur. Ağırlık ikisini de doğru bulur. Sabit derinlik birini kesip diğerini şişirir.

### Ölçüm (10 depo, bu makine)

| Depo | Dosya | Çıktı satırı | Token |
|---|---|---|---|
| `Projects/tooling` | 7.466 | 85 | 575 |
| `Projects/api-platform` | 1.120 | 72 | 499 |
| `Projects/api-platform-onprem` | 326 | 55 | 329 |
| `Projects/data-service` | 246 | 41 | 317 |
| `Projects/dealer-admin` | 135 | 49 | 241 |
| `Desktop/process-template` | 86 | 59 | 309 |
| `Projects/notes` | 71 | 17 | 88 |
| `Projects/web-app` | 28 | 14 | 58 |
| `Projects/mobile-poc/app` | 17 | 12 | 39 |
| `Desktop/doguxclaude` | 4 | 4 | 11 |
| **TOPLAM** | **9.499** | — | **2.465** |

Süre: **88 ms**. Toplam çıktı **8,6 KB**.

**Kilit özellik:** çıktı dosya sayısıyla büyümüyor. 7.466 dosyalık depo 575 token, 1.120 dosyalık depo 499 token. Yüz bin dosyalık depo da benzer çıkar.

### Örnek çıktı

```
packages/  (999)
  api/  (297)
    src/  (288)
      services/  (132)
      repositories/  (60)
      handlers/  (54)
        … 27 klasör daha (52 dosya): task-dispatcher, audit, auth…
      … 4 klasör daha (42 dosya): middleware, providers, notifications…
    scripts/  (5)
  web/  (281)
    src/  (273)
      components/  (108)
        … 17 klasör daha (105 dosya): project, ui, common…
```

### Nerede kullanılacak

`hive/index.md` (harita) bu çıktıdan üretilir:
- **Katman 0:** depo listesi — 10 depo, 1 KB (Karar 1'deki tarama).
- **Katman 1:** içinde bulunulan deponun özeti — ~500 token (bu algoritma).
- Diğer dokuz deponun özeti yüklenmez; istendiğinde 9 ms'de üretilir.

### Açık sorular

- %2 eşiği ve 4 kardeş sayısı ölçümle seçilmedi, gözle iyi göründü. Farklı depolarda denenip ayarlanmalı.
- Klasör adının yanına baskın dil eklensin mi (`services/ (132, TypeScript)`)? Bedava geliyor ama satırı uzatıyor.
- Özet saklanacak mı, yoksa her oturumda yeniden mi üretilecek? 9 ms olduğu için saklamamak savunulabilir; o zaman `index.md` diye bir dosya da gerekmez.
