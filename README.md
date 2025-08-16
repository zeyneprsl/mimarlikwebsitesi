# Berra Mimarlık Web Sitesi

Modern ve responsive mimarlık web sitesi. Netlify üzerinde canlı olarak çalışır.

## Özellikler

- 🏗️ Modern ve responsive tasarım
- 📱 Mobil uyumlu
- ❤️ Proje beğeni sistemi
- 🖼️ Proje galerisi
- 📧 İletişim formu
- 🚀 Netlify Functions ile backend
- ⚡ Hızlı yükleme

## Teknolojiler

- HTML5
- CSS3 (Modern CSS Grid ve Flexbox)
- Vanilla JavaScript (ES6+)
- Netlify Functions (Serverless backend)
- Responsive Design

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd BerraMimarlık
```

2. Netlify'da deploy edin:
   - Netlify hesabınıza giriş yapın
   - "New site from Git" seçin
   - GitHub repository'nizi bağlayın
   - Deploy edin

## Proje Yapısı

```
BerraMimarlık/
├── index.html          # Ana sayfa
├── project.html        # Proje detay sayfası
├── style.css           # Ana stil dosyası
├── script.js           # Ana JavaScript dosyası
├── netlify.toml        # Netlify yapılandırması
├── netlify/
│   └── functions/      # Netlify Functions
│       ├── projects.js # Projeleri getir
│       ├── like.js     # Beğeni ekle
│       └── unlike.js   # Beğeni kaldır
├── data/
│   └── projects.json   # Proje verileri
├── icons/              # SVG ikonlar
└── uploads/            # Proje resimleri
```

## Netlify Functions

Proje backend işlemleri için Netlify Functions kullanır:

- **`/api/projects`** - Tüm projeleri getir
- **`/api/like`** - Projeye beğeni ekle
- **`/api/unlike`** - Projeden beğeni kaldır

## Özelleştirme

### Yeni Proje Ekleme

`data/projects.json` dosyasına yeni proje ekleyin:

```json
{
  "id": 9,
  "name": "Yeni Proje",
  "desc": "Proje açıklaması",
  "image": "/uploads/yeni-proje.jpg",
  "tags": ["Mimari", "Tasarım"],
  "likes": 0,
  "city": "İstanbul",
  "year": "2024"
}
```

### Stil Değişiklikleri

`style.css` dosyasında renkleri ve stilleri özelleştirin:

```css
:root {
  --primary-color: #bfa97a;
  --secondary-color: #ff6b6b;
  --background-color: #faf9f6;
}
```

## Deploy

Proje otomatik olarak Netlify'da deploy edilir. Her GitHub push'unda yeni versiyon yayınlanır.

## Lisans

MIT License

## İletişim

Berra Mimarlık - info@berramimarlik.com
