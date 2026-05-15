import type { AnalysisResult, LogEntry, NamespaceSummary, PodSummary } from '../types'

// Severity badge renk tanımları (export HTML için inline stil)
const SEVERITY_STYLES: Record<string, string> = {
  fatal: 'background:#4c1d95;color:#e9d5ff;',
  panic: 'background:#701a75;color:#f5d0fe;',
  error: 'background:#450a0a;color:#fca5a5;',
  exception: 'background:#431407;color:#fed7aa;',
  warning: 'background:#422006;color:#fef08a;'
}

const SEVERITY_ROW_STYLES: Record<string, string> = {
  fatal: 'background:#1a0533;border-left:3px solid #a855f7;',
  panic: 'background:#1a0620;border-left:3px solid #d946ef;',
  error: 'background:#1a0202;border-left:3px solid #ef4444;',
  exception: 'background:#1a0900;border-left:3px solid #f97316;',
  warning: 'background:#1a1100;border-left:3px solid #eab308;'
}

// Log girdilerini tablo satırlarına çevirir
function renderLogRows(entries: LogEntry[]): string {
  return entries
    .map(entry => {
      const rowStyle = SEVERITY_ROW_STYLES[entry.severity] ?? ''
      const badgeStyle = SEVERITY_STYLES[entry.severity] ?? ''
      const safeRaw = entry.raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

      return `
      <tr style="${rowStyle}">
        <td style="padding:4px 8px;color:#64748b;font-size:11px;white-space:nowrap;">${entry.lineNumber}</td>
        <td style="padding:4px 8px;white-space:nowrap;">
          <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:600;${badgeStyle}">
            ${entry.severity.toUpperCase()}
          </span>
        </td>
        <td style="padding:4px 8px;color:#94a3b8;font-size:11px;white-space:nowrap;">${entry.timestamp ?? '—'}</td>
        <td style="padding:4px 8px;color:#cbd5e1;font-size:11px;font-family:monospace;word-break:break-all;">${safeRaw}</td>
      </tr>`
    })
    .join('')
}

// Namespace özet kartları HTML'i üretir
function renderNamespaceCards(summaries: NamespaceSummary[]): string {
  return summaries
    .map(ns => `
    <div style="background:#141b24;border:1px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0;">${ns.namespace}</h3>
        <span style="color:#94a3b8;font-size:12px;">${ns.affectedFiles} dosya · ${ns.affectedPods.length} pod</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${ns.fatalCount > 0 ? `<span style="padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:#4c1d95;color:#e9d5ff;">Fatal: ${ns.fatalCount}</span>` : ''}
        ${ns.panicCount > 0 ? `<span style="padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:#701a75;color:#f5d0fe;">Panic: ${ns.panicCount}</span>` : ''}
        ${ns.errorCount > 0 ? `<span style="padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:#450a0a;color:#fca5a5;">Error: ${ns.errorCount}</span>` : ''}
        ${ns.exceptionCount > 0 ? `<span style="padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:#431407;color:#fed7aa;">Exception: ${ns.exceptionCount}</span>` : ''}
      </div>
    </div>`)
    .join('')
}

// Pod özetlerini accordion şeklinde HTML'e çevirir
function renderPodAccordions(podSummaries: PodSummary[]): string {
  return podSummaries
    .slice(0, 20) // En fazla 20 pod göster (export boyutunu sınırla)
    .map((pod, podIdx) => `
    <details style="margin-bottom:8px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;overflow:hidden;">
      <summary style="padding:12px 16px;cursor:pointer;color:#cbd5e1;font-size:13px;font-weight:500;display:flex;justify-content:space-between;list-style:none;">
        <span>📦 ${pod.namespace} / <strong>${pod.podName}</strong></span>
        <span style="color:#f87171;font-weight:600;">${pod.totalErrors} hata</span>
      </summary>
      <div style="padding:12px 16px;border-top:1px solid #1e293b;">
        ${pod.containers.map(container => `
          <div style="margin-bottom:12px;">
            <div style="color:#7dd3fc;font-size:12px;font-weight:600;margin-bottom:8px;">Container: ${container.containerName}</div>
            <table style="width:100%;border-collapse:collapse;font-family:monospace;">
              <thead>
                <tr style="background:#1e293b;">
                  <th style="padding:6px 8px;text-align:left;color:#64748b;font-size:11px;width:50px;">Satır</th>
                  <th style="padding:6px 8px;text-align:left;color:#64748b;font-size:11px;width:80px;">Seviye</th>
                  <th style="padding:6px 8px;text-align:left;color:#64748b;font-size:11px;width:160px;">Zaman</th>
                  <th style="padding:6px 8px;text-align:left;color:#64748b;font-size:11px;">Log Satırı</th>
                </tr>
              </thead>
              <tbody>${renderLogRows(container.entries.slice(0, 50))}</tbody>
            </table>
            ${container.entries.length > 50 ? `<div style="color:#64748b;font-size:11px;padding:8px;text-align:center;">... ve ${container.entries.length - 50} satır daha</div>` : ''}
          </div>
        `).join('')}
      </div>
    </details>`)
    .join('')
}

// Tüm analiz sonucunu tek bir taşınabilir HTML dosyasına dönüştürür
export function exportToHtml(result: AnalysisResult): string {
  const totalIssues = result.totalEntries
  const fatalCount = result.allEntries.filter(e => e.severity === 'fatal').length
  const panicCount = result.allEntries.filter(e => e.severity === 'panic').length
  const errorCount = result.allEntries.filter(e => e.severity === 'error').length
  const exceptionCount = result.allEntries.filter(e => e.severity === 'exception').length

  const analysisDate = new Date(result.analysisDate).toLocaleString('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'medium'
  })

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Must-Gather Analiz Raporu — ${result.rootPath}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      background: #08101c;
      color: #e2e8f0;
      line-height: 1.5;
      padding: 24px;
    }
    h1 { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; }
    details summary::-webkit-details-marker { display: none; }
    details summary::marker { display: none; }
    table { border-collapse: collapse; }
    @media print {
      body { background: white; color: black; }
    }
  </style>
</head>
<body>
  <!-- Başlık -->
  <div style="max-width:1200px;margin:0 auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #1e293b;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#f1f5f9;letter-spacing:-0.5px;">
          Must-Gather Log Analiz Raporu
        </h1>
        <p style="color:#64748b;font-size:13px;margin-top:4px;">
          ${result.rootPath} · ${analysisDate}
        </p>
      </div>
      <div style="text-align:right;">
        <div style="color:#94a3b8;font-size:12px;">Toplam Hata</div>
        <div style="font-size:28px;font-weight:700;color:#f87171;">${totalIssues.toLocaleString('tr-TR')}</div>
      </div>
    </div>

    <!-- Özet Metrik Kartları -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:32px;">
      <div style="background:#1a0533;border:1px solid #4c1d95;border-radius:8px;padding:16px;">
        <div style="color:#a78bfa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Fatal</div>
        <div style="font-size:32px;font-weight:700;color:#c084fc;">${fatalCount.toLocaleString('tr-TR')}</div>
      </div>
      <div style="background:#1a0620;border:1px solid #701a75;border-radius:8px;padding:16px;">
        <div style="color:#e879f9;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Panic</div>
        <div style="font-size:32px;font-weight:700;color:#f0abfc;">${panicCount.toLocaleString('tr-TR')}</div>
      </div>
      <div style="background:#1a0202;border:1px solid #7f1d1d;border-radius:8px;padding:16px;">
        <div style="color:#fca5a5;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Error</div>
        <div style="font-size:32px;font-weight:700;color:#f87171;">${errorCount.toLocaleString('tr-TR')}</div>
      </div>
      <div style="background:#1a0900;border:1px solid #7c2d12;border-radius:8px;padding:16px;">
        <div style="color:#fed7aa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Exception</div>
        <div style="font-size:32px;font-weight:700;color:#fb923c;">${exceptionCount.toLocaleString('tr-TR')}</div>
      </div>
      <div style="background:#141b24;border:1px solid #1e293b;border-radius:8px;padding:16px;">
        <div style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Analiz Edilen Dosya</div>
        <div style="font-size:32px;font-weight:700;color:#7dd3fc;">${result.analyzedFiles.toLocaleString('tr-TR')}</div>
      </div>
      <div style="background:#141b24;border:1px solid #1e293b;border-radius:8px;padding:16px;">
        <div style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Namespace</div>
        <div style="font-size:32px;font-weight:700;color:#34d399;">${result.namespaceSummaries.length.toLocaleString('tr-TR')}</div>
      </div>
    </div>

    <!-- Namespace Özetleri -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:16px;font-weight:600;color:#cbd5e1;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <span style="width:3px;height:16px;background:#7dd3fc;display:inline-block;border-radius:2px;"></span>
        Namespace Özetleri
      </h2>
      ${renderNamespaceCards(result.namespaceSummaries)}
    </div>

    <!-- Pod/Container Detayları -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:16px;font-weight:600;color:#cbd5e1;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <span style="width:3px;height:16px;background:#f87171;display:inline-block;border-radius:2px;"></span>
        Pod / Container Detayları
      </h2>
      ${renderPodAccordions(result.podSummaries)}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1e293b;padding-top:16px;text-align:center;color:#334155;font-size:12px;">
      Must-Gather Log Analyzer tarafından ${analysisDate} tarihinde oluşturuldu.
      Toplam ${result.totalFiles} dosya tarandı, ${result.analyzedFiles} log dosyası analiz edildi.
    </div>
  </div>
</body>
</html>`
}

// HTML string'ini dosya olarak indirme işlemini tetikler
export function downloadHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Bellek sızıntısını önlemek için URL'yi temizle
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
