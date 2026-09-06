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
