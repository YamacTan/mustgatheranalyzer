# Must-Gather Log Analyzer

OpenShift/Kubernetes cluster problemlerini hızlı ve etkili bir şekilde tanılamak için `must-gather` çıktılarını derinlemesine analiz eden, tarayıcı tabanlı (client-side only) profesyonel log analiz aracı.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF?logo=vite)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Gereksinimler](#-gereksinimler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [API & Bileşenler](#-api--bileşenler)
- [Güvenlik](#-güvenlik)
- [Geliştirme](#-geliştirme)
- [Yapı & Deploy](#-yapı--deploy)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 🎯 Core Functionality

- **Lokal Dosya Seçimi**: Tarayıcının File System Access API'sı ile must-gather klasörünü güvenli bir şekilde seçin
  - Hiçbir veri sunucuya gönderilmez - tamamen local işlem
  - Chrome/Edge tarayıcılarında desteklenir
  - İlk kullanımda kullanıcı izni gerekir

- **Recursive Log Taraması**: Tüm must-gather yapısını otomatik keşif
  - Namespaces → Pods → Containers → Logs hiyerarşisi
  - Tüm `.log` dosyalarını bulup işleme alır
  - Progress tracking ile kullanıcı feedback

- **Akıllı Log Parsing**: Çoklu log format desteği
  - **JSON Logs**: `ts`, `time`, `timestamp` alanlarını otomatik tespit
  - **ISO 8601 Timestamps**: RFC 3339 formatı desteği
  - **Kubernetes klog Format**: `I/E/F/W` prefix + MMDD + time
  - **Unix Epoch Timestamps**: Sayısal zaman damgaları
  - **Syslog/Journald Format**: Standart sistem log formatları

- **5-Seviyeli Severity Deteksiyonu**:
  - `FATAL` (Mor - #4c1d95)
  - `PANIC` (Fuşya - #701a75)
  - `ERROR` (Kırmızı - #450a0a)
  - `EXCEPTION` (Turuncu - #431407)
  - `WARNING` (Sarı - #422006)

### 📊 Dashboard & Analitikler

- **Summary Cards**: İstatistiksel özet (Fatal, Panic, Error, Exception, Warning sayıları)
- **Severity Distribution Chart**: Namespace başına error dağılımı görselleştirmesi
- **Interactive Namespace Filter**: Seçili namespace'e göre verileri dinamik filtreleme
- **Pod/Container Tablosu**: Pod ve container düzeyinde detaylı error listeleme
- **Zaman Çizelgesi (Timeline)**: Error'ların zaman bazında dağılımı

### 🔍 Advanced Log Viewer

- **Güçlü Filtreleme**:
  - Severity seviyesi seçme
  - Metin arama (Case-sensitive/insensitive)
  - **Regex desteği**: Standart ve advanced search
  - "Sadece Hataları Göster" modu

- **Navigation**: Eşleşen satırlar arasında önceki/sonraki ile gezinme
- **Rich Display**: Satır numaraları, timestamp'ler ve formatlanmış output
- **Export Options**: CSV veya TXT formatında log dosyası indirme

### 📁 Dosya Ağacı (File Tree)

- Sol sidebar'da tüm dosyaların hiyerarşik gösterimi
- Daraltılabilir/Genişletilebilir klasörler
- Error count badge'leri (her klasördeki hata sayısı)
- Dosya adı arama ve filtreleme

### 💾 HTML Rapor Exportu

- Tüm analiz sonucunu taşınabilir **single-file HTML** olarak export
- **Self-contained**: Tüm CSS ve veri inline
- Namespace özetleri, pod accordion'ları, detaylı log listeleri
- Tarih damgalı dosya adı (`must-gather-report-2024-05-15.html`)

---

## 🛠️ Teknoloji Stack

### Frontend Framework

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| **React** | 19.0.0 | UI framework |
| **TypeScript** | 5.6.2 | Type-safe development |
| **Vite** | 5.2.0 | Lightning-fast build tool |
| **React SWC** | 3.0.0 | Fast JSX transpilation |

### Styling & UI

| Paket | Versiyon | Amaç |
|-------|----------|------|
| **Tailwind CSS** | 3.4.9 | Utility-first CSS framework |
| **PostCSS** | 8.4.32 | CSS preprocessing |
| **Autoprefixer** | 10.4.18 | Browser compatibility |
| **Lucide React** | 1.0.8 | Beautiful icon library |

### Build & Export

| Paket | Versiyon | Amaç |
|-------|----------|------|
| **vite-plugin-singlefile** | 2.3.2 | Single-file HTML export |

### Browser APIs

- **File System Access API**: Lokal dosya sistemine read-only erişim
- **Blob API**: File download mekanizması
- **URL.createObjectURL()**: Blob-to-URL conversion

---

## 📦 Gereksinimler

### Sistem Gereksinimleri

- **Node.js**: v16.0.0 veya daha yüksek
- **npm**: v8.0.0 veya daha yüksek
- **Disk Alanı**: Development: 500MB, Production build: 1-2MB
- **RAM**: Development: 512MB, Büyük must-gather analizi: 2-4GB

### Browser Gereksinimleri

- **Chrome**: v97+
- **Microsoft Edge**: v97+
- **Opera**: v83+
- **Safari**: Desteklenmemiyor (File System Access API desteği yok)
- **Firefox**: Desteklenmemiyor (File System Access API desteği yok)

> **Not**: File System Access API sadece belirtilen tarayıcılarda kullanılabilir.

---

## 🚀 Kurulum

### 1. Projeyi klonlayın

```bash
git clone https://github.com/yourusername/mustgatheranalyzer.git
cd mustgatheranalyzer
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Tarayıcınız otomatik olarak `http://localhost:5173` adresinde açılacaktır.

---

## 💻 Kullanım

### Adım 1: must-gather Klasörünü Seçin

1. Uygulamayı açın
2. **"Klasör Seç"** düğmesine tıklayın
3. İşletim sisteminizde must-gather çıktısının bulunduğu **klasörü seçin**
4. Tarayıcı izni isteyecektir - onaylayın

```
must-gather-openshift-node-20240515/
├── cluster-scoped-resources/
├── namespaces/
│   ├── default/
│   ├── kube-system/
│   ├── openshift-monitoring/
│   └── ...
└── [diğer dosyalar]
```

### Adım 2: Otomatik Analiz

Klasör seçildikten sonra uygulama şunları yapar:

1. **Struktur Keşfi**: Tüm namespaces, pods ve containers bulur
2. **Log Taraması**: Her `.log` dosyasında hata ve uyarıları arar
3. **Zaman Damgası Çıkarma**: Logun oluşturulduğu zamanı tespit eder
4. **İstatistik Hesaplama**: Severity seviyesi sayısını ve dağılımını hesaplar
5. **Progress Gösterimi**: Tüm sürecü real-time gösterir

### Adım 3: Dashboard'u İnceleyebilirsiniz

Dashboard, özet bilgileri gösterir:

- **Summary Cards**: Fatal, Panic, Error, Exception, Warning, Dosya, Namespace ve Pod sayıları
- **Severity Chart**: Namespace başına error dağılımı (bar chart)
- **Namespace Filter**: İlgilendiğiniz namespace'i seçerek filtreleme
- **Pod Table**: Seçili namespace içindeki pod/container'ları ve error sayılarını listeler

```
┌─────────────────────────────────────────┐
│  Fatal  │  Panic  │  Error  │  Exc.  │
│   12    │   45    │  128    │   34   │
└─────────────────────────────────────────┘

[Bar Chart: Namespace başına error sayıları]

Namespace Filter:  [Select Namespace ▼]
├─ kube-system (56 errors)
├─ openshift-node (234 errors)
└─ default (12 errors)

Pod Table:
Pod Name          Container          Errors  Warnings
─────────────────────────────────────────────────────
etcd-master-0     etcd               45      8
apiserver-xyz     apiserver          78      12
```

### Adım 4: Log Viewer'ı Kullanın

Detaylı log satırlarını görmek için:

1. **Search/Filter**: Arama kutusuna yazarak filtrele
   - Metin arama: `error`, `connection timeout` vb.
   - Regex: `/panic.*database/` (slash ile başlayan)

2. **Severity Filter**: Dropdown ile severity seçin
   - All Levels
   - Fatal Only
   - Panic Only
   - Error Only
   - Exception Only
   - Warning Only

3. **Show Only Errors**: Checkbox ile sadece error'ları göster

4. **Navigation**: Bulduğunuz eşleşmeler arasında gezinin
   - ← Önceki Match
   - Sonraki Match →

5. **Export**: Log'u CSV veya TXT olarak indir

### Adım 5: HTML Rapor Oluşturun

Tüm analizi taşınabilir bir HTML dosyası olarak dışa aktarın:

1. **Export Düğmesine** tıklayın
2. Otomatik olarak `must-gather-report-YYYY-MM-DD.html` indirilir
3. Dosyayı tarayıcıda açın (internet bağlantısı gerekmez)
4. E-posta ile gönderin veya paylaşın

```bash
# İndirilen dosya
must-gather-report-2024-05-15.html  (~800KB - 1MB)
```

---

## 📁 Proje Yapısı

```
mustgatheranalyzer/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx             # Severity badge bileşeni
│   │   │   └── Button.tsx            # Standart düğme bileşeni
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx         # Dashboard ana koordinatörü
│   │   │   ├── SummaryCards.tsx      # İstatistik kartları
│   │   │   ├── SeverityChart.tsx     # Error dağılım grafiği
│   │   │   ├── NamespaceCards.tsx    # Namespace filter kartları
│   │   │   ├── PodTable.tsx          # Pod/Container tablosu
│   │   │   └── Timeline.tsx          # Zaman çizelgesi
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Sol kenar çubuğu (daraltılabilir)
│   │   │   └── MainContent.tsx       # Merkezi içerik alanı
│   │   ├── tree/
│   │   │   ├── FileTree.tsx          # Dosya ağacı wrapper
│   │   │   └── TreeNode.tsx          # Ağaç düğümü (dir/file)
│   │   └── viewer/
│   │       ├── LogViewer.tsx         # Ana log görüntüleyici
│   │       ├── LogLine.tsx           # Tek log satırı
│   │       └── SearchBar.tsx         # Arama ve filtreleme
│   ├── hooks/
│   │   ├── useFileSystem.ts          # File System Access API entegrasyonu
│   │   └── useLogAnalysis.ts         # Log analiz state yönetimi
│   ├── utils/
│   │   ├── logParser.ts              # Log parsing ve analiz logic (376 satır)
│   │   ├── fileTree.ts               # Dosya ağacı inşası (236 satır)
│   │   └── exportHtml.ts             # HTML rapor exportu (222 satır)
│   ├── types/
│   │   └── index.ts                  # Merkezi TypeScript type tanımları
│   ├── App.tsx                       # Ana uygulama bileşeni
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global Tailwind stiller
├── public/
│   └── [static assets varsa]
├── index.html                        # HTML şablonu
├── package.json                      # Proje metadata & dependencies
├── tsconfig.json                     # TypeScript konfigürasyonu
├── vite.config.ts                    # Vite build konfigürasyonu
├── tailwind.config.js                # Tailwind CSS teması
├── postcss.config.js                 # PostCSS konfigürasyonu
├── .gitignore                        # Git ignore rules
└── README.md                         # Bu dosya
```

### Dosya Boyutları

| Dosya/Klasör | Satır Sayısı | Amaç |
|--------------|-------------|------|
| `logParser.ts` | 376 | Core parsing logic |
| `fileTree.ts` | 236 | Tree traversal |
| `exportHtml.ts` | 222 | HTML report generation |
| `useLogAnalysis.ts` | 142 | State management |
| `App.tsx` | 89 | Main app component |
| **TOPLAM** | **2,847** | Tüm kaynak kodu |

---

## 🔌 API & Bileşenler

### Custom Hooks

#### `useFileSystem()`

```typescript
const {
  pickDirectory,        // () => Promise<void>
  isReading,           // boolean - loading state
  error                // string | null
} = useFileSystem();

// Kullanım
const handleSelectFolder = async () => {
  await pickDirectory();
};
```

**Açıklama**: Tarayıcıda klasör seçimi dialogu açar ve dosya ağacını yükler.

---

#### `useLogAnalysis()`

```typescript
const {
  // State
  view,                        // 'welcome' | 'loading' | 'dashboard' | 'viewer'
  isAnalyzing,                // boolean
  namespaces,                 // NamespaceSummary[]
  selectedNamespace,          // string | null
  selectedPod,                // string | null
  selectedFile,               // FileNode | null
  logFiles,                   // LogFile[]
  filteredLogs,               // ParsedLog[]
  error,                      // string | null

  // Actions
  startAnalysis,              // (files: File[]) => Promise<void>
  selectNamespace,            // (name: string) => void
  selectPod,                  // (namespace: string, name: string) => void
  selectFile,                 // (file: FileNode) => void
  updateFilters,              // (filters: LogFilterOptions) => void
  exportToHtml,               // () => void
  reset,                      // () => void
} = useLogAnalysis();
```

**Açıklama**: Tüm log analiz state'ini ve action'larını yönetir.

---

### Log Parser Utilities

#### `parseLogContent(content: string): ParsedLog[]`

```typescript
const logs = parseLogContent(logFileContent);

// Döner
[
  {
    severity: 'ERROR',
    message: 'Connection timeout',
    timestamp: '2024-05-15T10:23:45Z',
    lineNumber: 142,
    line: 'Full log line...'
  },
  // ... diğer loglar
]
```

**Amaç**: Log dosyasını parse edip structured data'ya çevirir.

---

#### `buildFileTree(files: FileSystemFileHandle[]): FileNode`

```typescript
const tree = await buildFileTree(selectedDirectories);

// Döner
{
  name: 'namespaces',
  type: 'directory',
  children: [
    { name: 'kube-system', type: 'directory', children: [...], errorCount: 45 },
    { name: 'default', type: 'directory', children: [...], errorCount: 12 }
  ],
  errorCount: 57
}
```

**Amaç**: Dosya sistemini recursive tree yapısına dönüştürür.

---

#### `extractTimestamp(line: string): Date | null`

```typescript
const timestamp = extractTimestamp('2024-05-15T10:23:45Z error: ...');
// Döner: Date object veya null
```

**Amaç**: Log satırından timestamp'i 6 farklı format'ta çıkarır.

---

### Export & Download

#### `exportToHtml(analysisData): void`

```typescript
const handleExport = () => {
  exportToHtml({
    namespaces: namespaceSummaries,
    pods: podSummaries,
    logFiles,
    selectedNamespace
  });
};
```

**Amaç**: Tüm analiz sonucunu self-contained HTML dosyası olarak indirir.

---

## 🔐 Güvenlik

### ✅ Güvenlik Özellikleri

1. **Client-Side Only Processing**
   - Tüm analiz local tarayıcıda çalışır
   - Sunucuya veri gönderilmez
   - Çevrimdışı çalışabilir

2. **Read-Only File Access**
   - File System Access API sadece okuma izni ister
   - Dosya silme/yazma imkanı yok
   - Yalnızca seçilen klasöre erişim

3. **No External Network Calls**
   - CDN'ye bağımlı değil
   - API call yok
   - Completely offline-capable

4. **Data Privacy**
   - Analiz verisi bellekte tutulur (session)
   - localStorage/cookies kullanılmaz
   - Session sona erince veri silinir
   - Exported HTML'de gizli bilgi kontrolü

5. **No Authentication Required**
   - Login mekanizması yok
   - Credential'lar tutulmaz
   - User tracking yok

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Large Files**: Çok büyük must-gather'lar (~10GB+) RAM kullanabilir
   - İdeal: 100MB - 2GB
   - Maksimum: ~5GB

2. **Browser Compatibility**: Sadece Chrome/Edge desteklenir
   - File System Access API browser-specific özelliği

3. **XSS Prevention**: HTML export'te XSS'ten korunmak için:
   - Log içeriği sanitized
   - HTML special chars escaped
   - Script tag'leri filtreli

---

## 🛠️ Geliştirme

### Geliştirme Ortamını Kurma

```bash
# 1. Projeyi klonlayın
git clone https://github.com/yourusername/mustgatheranalyzer.git
cd mustgatheranalyzer

# 2. Bağımlılıkları yükleyin
npm install

# 3. Dev sunucusunu başlatın
npm run dev

# 4. Tarayıcıda açın
# http://localhost:5173
```

### Kod Stilini İnceleme

```bash
# TypeScript type checking (build sırasında yapılır)
npm run build

# ESLint (varsa)
npm run lint
```

### Yeni Component Ekleme

```typescript
// src/components/myFeature/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  // ...
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="bg-ink rounded-lg p-4">
      <h2 className="text-white">{title}</h2>
      {/* İçerik */}
    </div>
  );
};
```

### State Management Pattern

```typescript
// useLogAnalysis içinde
const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);

const selectNamespace = useCallback((namespace: string) => {
  setSelectedNamespace(namespace);
  // filtered logs'ı update et
}, [logFiles]);
```

### Renk Paletini Kullanma

Projede önceden tanımlanmış Tailwind colors vardır:

```typescript
// Dark theme
className="bg-midnight text-white"     // #08101c - Ana arka plan
className="bg-ink"                     // #141b24 - Kart/panel

// Severity colors
className="bg-red-950"                 // Error - #450a0a
className="bg-yellow-950"              // Warning - #422006
className="bg-purple-950"              // Fatal - #4c1d95
```

---

## 📦 Yapı & Deploy

### Development Build

```bash
npm run dev
```

- Vite dev server başlatır
- Hot module replacement (HMR) ile instant reload
- Source map debugging
- Port: `5173`

### Production Build

```bash
npm run build
```

**Output**: `dist/index.html` (single-file bundle)

- Minimized CSS/JS
- Inlined assets
- Self-contained (no external dependencies)
- File size: ~1-2MB

### Build'i Preview Etme

```bash
npm run preview
```

Üretim build'ini lokal olarak test etmek için.

### GitHub Pages'de Deploy

```bash
# 1. dist/ klasörünü push edin
git add dist/
git commit -m "build: production bundle"

# 2. GitHub Pages settings'te
# source: Deploy from a branch
# branch: main → /root

# 3. Erişin
https://yourusername.github.io/mustgatheranalyzer/
```

### Docker ile Deploy

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build & Run
docker build -t must-gather-analyzer .
docker run -p 8080:80 must-gather-analyzer
```

---

## 🤝 Katkıda Bulunma

Projeyi geliştirmeye yardımcı olmak istiyorsanız:

### 1. Issue Açın

Bulduğunuz hataları veya önerileri raporlayın:

```
Title: [BUG] Büyük dosyalarda tarama donuyor
Description: 
- Steps: 5GB+ must-gather seç
- Expected: Progress gösterilmeli
- Actual: UI freezes
```

### 2. Fork & Clone

```bash
git clone https://github.com/yourusername/mustgatheranalyzer.git
cd mustgatheranalyzer
git checkout -b feature/your-feature
```

### 3. Değişiklikleri Yap

```typescript
// src/utils/newFeature.ts
export const newFunction = () => {
  // Your code
};
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: yeni özellik eklendi - açıklama"
git push origin feature/your-feature
```

### 5. Pull Request Açın

- Değişiklikleri açıklayın
- Test sonuçlarını paylaşın
- Screenshot'lar ekleyin (varsa)

### Kodlama Kuralları

- **TypeScript**: `strict: true` mode
- **Naming**: camelCase (variables), PascalCase (components)
- **Comments**: Türkçe açıklamalar
- **Formatting**: Tailwind class'ları alfabetik sırada
- **Performance**: Unnecessary re-renders'dan kaçının

---

## 📝 Commit Message Format

```
<type>: <description>

<body>

<footer>
```

**Types**:
- `feat`: Yeni özellik
- `fix`: Hata düzeltmesi
- `refactor`: Kod reorganizasyonu
- `docs`: Dokümantasyon
- `perf`: Performance improvement
- `chore`: Build, dependencies vb.

**Örnekler**:

```
feat: log parsing'e regex desteği eklendi

Kullanıcılar artık advanced search için regex pattern'ları kullanabilir.
Filter logic'te /pattern/ formatı destekleniyor.

Closes #42
```

```
fix: sidebar'da namespace filter'ı çalışmıyor

PodTable'ın selectedNamespace prop'unu güncellemiyordu.
useCallback dependency'sine selectedNamespace eklendi.

Fixes #38
```

---

## 📚 Kaynaklar & Linkler

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemAccessHandle)
- [Kubernetes Troubleshooting](https://kubernetes.io/docs/tasks/debug-application-cluster/)
- [OpenShift must-gather](https://docs.openshift.com/container-platform/latest/support/gathering-cluster-data.html)

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

### MIT Lisansı Özet

✅ Ticari kullanım
✅ Değişiklik yapma
✅ Dağıtma
✅ Özel kullanım

❌ Sorumluluk reddi: Yazılım "olduğu gibi" sağlanır.


---


---

## 🐛 Sorun Raporlaması

Hata bulduysanız:

1. [GitHub Issues](https://github.com/yourusername/mustgatheranalyzer/issues) açın
2. Başlık: Sorunu açık bir şekilde tanımlayın
3. Açıklama:
   - Tekrarlama adımları
   - Beklenen davranış
   - Gerçek davranış
   - Browser version
   - must-gather size/type
4. Attachment: Screenshot veya log çıktısı

---

**Happy troubleshooting! 🚀**

*Last updated: 2024-05-15*
