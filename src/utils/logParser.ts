import type { LogEntry, Severity, TimelinePoint, NamespaceSummary, PodSummary, ContainerSummary } from '../types'

// Anahtar kelime → severity eşlemesi
const SEVERITY_MAP: Record<string, Severity> = {
  fatal: 'fatal',
  panic: 'panic',
  error: 'error',
  exception: 'exception',
  warning: 'warning'
}

// Log satırlarında hata anahtar kelimelerini yakalayan ana regex
const ERROR_PATTERN = /\b(fatal|panic|error|exception)\b/gi

// Yaygın log timestamp formatlarını tanıyan regex koleksiyonu
// Sıralama önemlidir: en özgün/uzun pattern önce gelir
const TIMESTAMP_PATTERNS = [
  // JSON log "ts"/"time"/"timestamp"/"@timestamp" field değeri
  // {"ts":"2024-04-12T14:23:01.123Z",...} veya {"time":"..."}
  /"(?:ts|time|timestamp|@timestamp|Time|Timestamp)"\s*:\s*"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^"]*)"/,

  // CRI/OCI container log prefix + ISO 8601 (nanosecond dahil):
  // 2024-04-12T14:23:01.123456789Z stdout F ...
  // 2024-04-12T14:23:01.123Z
  /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}|\+\d{4})?)/,

  // RFC 3339 boşluklu: 2024-01-15 10:30:00.000
  /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)/,

  // Kubernetes klog: E0412 14:23:01.123456   1 file.go:10]
  // Baştaki I/W/E/F harfi + MMDD + zaman
  /\b([IWEF]\d{4} \d{2}:\d{2}:\d{2}\.\d+)/,

  // Unix epoch (10 haneli saniye): 1705312200
  /\b(1[0-9]{9})\b/,

  // Syslog/journald: Apr 12 14:23:01  veya  Apr  2 14:23:01
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s{1,2}\d{1,2} \d{2}:\d{2}:\d{2})/i
]

// Dosya yolundan namespace, pod ve container bilgisini çıkarır
// Beklenen yapı: .../namespaces/<ns>/pods/<pod>/<container>/<logfile>.log
export function parseFilePathMeta(filePath: string): {
  namespace: string
  podName: string
  containerName: string
} {
  // Tüm yol ayırıcıları normalize et
  const normalized = filePath.replace(/\\/g, '/')
  const segments = normalized.split('/')

  let namespace = 'unknown'
  let podName = 'unknown'
  let containerName = 'unknown'

  // namespaces/<ns>/pods/<pod>/<container>/ kalıbını bul
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === 'namespaces' && segments[i + 1]) {
      namespace = segments[i + 1]
    }
    if (segments[i] === 'pods' && segments[i + 1]) {
      podName = segments[i + 1]
      if (segments[i + 2]) {
        containerName = segments[i + 2]
      }
    }
  }

  return { namespace, podName, containerName }
}

// Bir satırdan timestamp çıkarmaya çalışır
function extractTimestamp(line: string): string | null {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Timestamp stringini Date nesnesine dönüştürür
function parseTimestamp(ts: string): Date | null {
  // Nanosecond/microsecond fraksiyonunu milisaniyeye kırp (JS max 3 hane destekler)
  // "14:23:01.123456789Z" → "14:23:01.123Z"
  let normalized = ts.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})\d+/, '$1.$2')

  // Timezone suffix eksikse UTC olarak ekle
  // "2026-04-07T13:41:22" → "2026-04-07T13:41:22Z"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) {
    normalized = normalized + 'Z'
  }

  // ISO 8601, RFC 3339 ve benzeri formatlar
  const parsed = new Date(normalized)
  if (!isNaN(parsed.getTime())) return parsed

  // Unix timestamp (10 haneli saniye)
  if (/^\d{10}$/.test(ts)) {
    return new Date(parseInt(ts, 10) * 1000)
  }

  // Kubernetes klog: I0412 14:23:01.123456 → yılsız, ay+gün MMDD formatında
  const k8sMatch = ts.match(/[IWEF](\d{2})(\d{2}) (\d{2}:\d{2}:\d{2})/)
  if (k8sMatch) {
    const year = new Date().getFullYear()
    const month = k8sMatch[1]   // "04"
    const day   = k8sMatch[2]   // "12"
    const time  = k8sMatch[3]   // "14:23:01"
    const d = new Date(`${year}-${month}-${day}T${time}`)
    if (!isNaN(d.getTime())) return d
  }

  // Syslog/journald: "Apr 12 14:23:01" veya "Apr  2 14:23:01"
  const syslogMatch = ts.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s{1,2}(\d{1,2}) (\d{2}:\d{2}:\d{2})/i
  )
  if (syslogMatch) {
    const year = new Date().getFullYear()
    const d = new Date(`${syslogMatch[1]} ${syslogMatch[2]} ${year} ${syslogMatch[3]}`)
    if (!isNaN(d.getTime())) return d
  }

  return null
}

// Tek bir log dosyasının içeriğini satır satır analiz eder
export function parseLogContent(
  content: string,
  filePath: string,
  fileName: string
): LogEntry[] {
  const { namespace, podName, containerName } = parseFilePathMeta(filePath)
  const lines = content.split('\n')
  const entries: LogEntry[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Regex'i sıfırla (global flag ile her eşleşme için gerekli)
    ERROR_PATTERN.lastIndex = 0
    const match = ERROR_PATTERN.exec(line)

    if (match) {
      const keyword = match[1].toLowerCase()
      const severity = SEVERITY_MAP[keyword] ?? 'error'
      const timestamp = extractTimestamp(line)

      entries.push({
        lineNumber: i + 1,
        raw: line,
        severity,
        timestamp,
        namespace,
        podName,
        containerName,
        filePath,
        fileName,
        matchedKeyword: keyword
      })
    }
  }

  return entries
}

// Tüm log girdilerinden namespace bazlı özetleri üretir
export function buildNamespaceSummaries(allEntries: LogEntry[]): NamespaceSummary[] {
  const summaryMap = new Map<string, NamespaceSummary>()

  for (const entry of allEntries) {
    const ns = entry.namespace

    if (!summaryMap.has(ns)) {
      summaryMap.set(ns, {
        namespace: ns,
        totalErrors: 0,
        fatalCount: 0,
        panicCount: 0,
        errorCount: 0,
        exceptionCount: 0,
        warningCount: 0,
        affectedFiles: 0,
        affectedPods: []
      })
    }

    const summary = summaryMap.get(ns)!
    summary.totalErrors++

    switch (entry.severity) {
      case 'fatal': summary.fatalCount++; break
      case 'panic': summary.panicCount++; break
      case 'error': summary.errorCount++; break
      case 'exception': summary.exceptionCount++; break
      case 'warning': summary.warningCount++; break
    }

    if (!summary.affectedPods.includes(entry.podName)) {
      summary.affectedPods.push(entry.podName)
    }
  }

  // Dosya sayısını ayrıca hesapla
  const fileCountMap = new Map<string, Set<string>>()
  for (const entry of allEntries) {
    if (!fileCountMap.has(entry.namespace)) {
      fileCountMap.set(entry.namespace, new Set())
    }
    fileCountMap.get(entry.namespace)!.add(entry.filePath)
  }

  for (const [ns, summary] of summaryMap) {
    summary.affectedFiles = fileCountMap.get(ns)?.size ?? 0
  }

  // Toplam hataya göre azalan sırada döndür
  return Array.from(summaryMap.values()).sort((a, b) => b.totalErrors - a.totalErrors)
}

// Tüm log girdilerinden pod/container bazlı özetleri üretir
export function buildPodSummaries(allEntries: LogEntry[]): PodSummary[] {
  const podMap = new Map<string, Map<string, ContainerSummary>>()

  for (const entry of allEntries) {
    const podKey = `${entry.namespace}/${entry.podName}`

    if (!podMap.has(podKey)) {
      podMap.set(podKey, new Map())
    }

    const containerMap = podMap.get(podKey)!

    if (!containerMap.has(entry.containerName)) {
      containerMap.set(entry.containerName, {
        containerName: entry.containerName,
        logFiles: [],
        entries: [],
        errorCount: 0
      })
    }

    const container = containerMap.get(entry.containerName)!
    container.entries.push(entry)
    container.errorCount++

    if (!container.logFiles.includes(entry.filePath)) {
      container.logFiles.push(entry.filePath)
    }
  }

  const podSummaries: PodSummary[] = []

  for (const [podKey, containerMap] of podMap) {
    const [namespace, podName] = podKey.split('/')
    const containers = Array.from(containerMap.values())
    const totalErrors = containers.reduce((sum, c) => sum + c.errorCount, 0)

    podSummaries.push({
      namespace,
      podName,
      containers,
      totalErrors
    })
  }

  return podSummaries.sort((a, b) => b.totalErrors - a.totalErrors)
}

// Log girdilerinden zaman çizelgesi noktalarını üretir
// 5 dakikalık bucket'lara gruplar (daha okunabilir grafik)
export function buildTimelinePoints(allEntries: LogEntry[]): TimelinePoint[] {
  const bucketMap = new Map<string, TimelinePoint>()
  let parsedCount = 0

  for (const entry of allEntries) {
    if (!entry.timestamp) continue

    const date = parseTimestamp(entry.timestamp)
    if (!date || isNaN(date.getTime())) continue

    parsedCount++

    // 5 dakikalık bucket: saniye ve dakika artığını sıfırla
    const bucketed = new Date(date)
    bucketed.setSeconds(0, 0)
    bucketed.setMinutes(Math.floor(bucketed.getMinutes() / 5) * 5)

    // Bucket key: severity + zaman (namespace dahil değil — renk karmaşasını önler)
    const bucketKey = `${entry.severity}::${bucketed.toISOString()}`

    if (!bucketMap.has(bucketKey)) {
      // Tarih + saat etiketi: gün farklıysa tarih de göster
      const now = new Date()
      const sameDay =
        bucketed.getFullYear() === now.getFullYear() &&
        bucketed.getMonth()    === now.getMonth()    &&
        bucketed.getDate()     === now.getDate()

      const label = sameDay
        ? bucketed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : bucketed.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }) +
          ' ' +
          bucketed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

      bucketMap.set(bucketKey, {
        timestamp: new Date(bucketed),
        severity: entry.severity,
        count: 0,
        namespace: entry.namespace,
        label
      })
    }

    bucketMap.get(bucketKey)!.count++
  }

  // Hiç parse edilemeyen timestamp yoksa boş dizi dön (Timeline "bulunamadı" mesajı gösterir)
  if (parsedCount === 0) return []

  return Array.from(bucketMap.values()).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )
}

// Severity'ye göre renk class'larını döndürür (Tailwind)
export function getSeverityColors(severity: Severity): {
  bg: string
  text: string
  border: string
  badge: string
  dot: string
} {
  switch (severity) {
    case 'fatal':
      return {
        bg: 'bg-purple-950/40',
        text: 'text-purple-300',
        border: 'border-purple-700/50',
        badge: 'bg-purple-900 text-purple-200',
        dot: 'bg-purple-400'
      }
    case 'panic':
      return {
        bg: 'bg-fuchsia-950/40',
        text: 'text-fuchsia-300',
        border: 'border-fuchsia-700/50',
        badge: 'bg-fuchsia-900 text-fuchsia-200',
        dot: 'bg-fuchsia-400'
      }
    case 'error':
      return {
        bg: 'bg-red-950/40',
        text: 'text-red-300',
        border: 'border-red-800/50',
        badge: 'bg-red-900 text-red-200',
        dot: 'bg-red-400'
      }
    case 'exception':
      return {
        bg: 'bg-orange-950/40',
        text: 'text-orange-300',
        border: 'border-orange-800/50',
        badge: 'bg-orange-900 text-orange-200',
        dot: 'bg-orange-400'
      }
    case 'warning':
      return {
        bg: 'bg-yellow-950/40',
        text: 'text-yellow-300',
        border: 'border-yellow-800/50',
        badge: 'bg-yellow-900 text-yellow-200',
        dot: 'bg-yellow-400'
      }
  }
}
