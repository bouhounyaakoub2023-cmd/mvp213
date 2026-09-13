import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock3, Factory, FileText, Gauge, PackageCheck } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Report } from '@/lib/types';

async function getReport(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('industrial_reports')
    .select('id,plant_code,period_start,period_end,record_count,validation_status,kpi_data,exceptions_data,report_text,created_at')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Report;
}

const fmt = (n: number | undefined) => new Intl.NumberFormat('en-US').format(n ?? 0);
const pct = (n: number | undefined) => `${(n ?? 0).toFixed(1)}%`;
const dateLabel = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return (
      <main className="report-page report-not-found">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to command center</Link>
        <div className="report-empty">
          <FileText size={30} />
          <h1>Report not found</h1>
          <p>The requested reporting period does not exist or is no longer available.</p>
        </div>
      </main>
    );
  }

  const k = report.kpi_data || {};
  const exceptions = report.exceptions_data || [];
  const statusValid = report.validation_status === 'VALID';
  const totalTarget = k.target_units ?? 0;
  const totalProduced = k.produced_units ?? 0;
  const totalGood = k.good_units ?? 0;
  const nonGood = Math.max(0, totalProduced - totalGood);

  return (
    <main className="report-page">
      <div className="report-topbar">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to command center</Link>
        <span className={`report-status ${statusValid ? 'valid' : 'review'}`}>
          {statusValid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          {report.validation_status}
        </span>
      </div>

      <header className="report-header">
        <div className="report-eyebrow"><Factory size={13} /> Industrial management report</div>
        <h1>{report.plant_code}</h1>
        <p className="report-period">{dateLabel(report.period_start)} — {dateLabel(report.period_end)}</p>
        <div className="report-meta">
          <span><FileText size={13} /> {report.record_count} validated production records</span>
          <span><Clock3 size={13} /> Generated {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.created_at))}</span>
        </div>
      </header>

      <section className="report-kpis">
        <div className="report-kpi"><div className="report-kpi-icon"><Gauge size={16} /></div><span>Target attainment</span><strong>{pct(k.target_attainment)}</strong><small>{fmt(totalProduced)} / {fmt(totalTarget)} units</small></div>
        <div className="report-kpi"><div className="report-kpi-icon"><PackageCheck size={16} /></div><span>Quality rate</span><strong>{pct(k.quality_rate)}</strong><small>{fmt(totalGood)} good / {fmt(totalProduced)} produced</small></div>
        <div className="report-kpi"><div className="report-kpi-icon"><Clock3 size={16} /></div><span>Downtime</span><strong>{fmt(k.downtime_minutes)} <em>min</em></strong><small>Across this reporting period</small></div>
        <div className="report-kpi"><div className="report-kpi-icon"><AlertTriangle size={16} /></div><span>Production gap</span><strong>{fmt(k.production_gap)} <em>units</em></strong><small>{nonGood > 0 ? `${fmt(nonGood)} non-good units` : 'No non-good units'}</small></div>
      </section>

      <div className="report-content-grid">
        <section className="report-card report-analysis">
          <div className="report-card-head">
            <div><span className="card-eyebrow">Executive output</span><h2>Management report</h2></div>
            <FileText size={17} />
          </div>
          {report.report_text ? <div className="report-html" dangerouslySetInnerHTML={{ __html: report.report_text }} /> : <div className="report-no-data">No formatted management report is stored for this period.</div>}
        </section>

        <aside className="report-card report-signals">
          <div className="report-card-head">
            <div><span className="card-eyebrow">Operational monitoring</span><h2>Signals</h2></div>
            <span className="signal-total">{exceptions.length}</span>
          </div>
          {exceptions.length === 0 ? (
            <div className="signal-empty"><CheckCircle2 size={22} /><strong>No active exceptions</strong><span>The reporting period is within configured thresholds.</span></div>
          ) : (
            <div className="signal-list">
              {exceptions.map((e, i) => (
                <div className="report-signal" key={`${e.record_id}-${i}`}>
                  <div className={`signal-dot ${e.severity.toLowerCase()}`} />
                  <div className="signal-body">
                    <div className="signal-line"><strong>{e.production_line_id}</strong><span className={`severity-label ${e.severity.toLowerCase()}`}>{e.severity}</span></div>
                    <b>{e.type.replaceAll('_', ' ')}</b>
                    <p>{e.message}</p>
                    <small>{e.record_id} · {e.shift}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <section className="report-card report-data">
        <div className="report-card-head">
          <div><span className="card-eyebrow">Traceability</span><h2>Production basis</h2></div>
          <span className="muted-note">Source records used for this report</span>
        </div>
        <div className="report-data-grid">
          <div><span>Plant</span><strong>{report.plant_code}</strong></div>
          <div><span>Reporting period</span><strong>{report.period_start} → {report.period_end}</strong></div>
          <div><span>Records processed</span><strong>{fmt(report.record_count)}</strong></div>
          <div><span>Validation</span><strong className={statusValid ? 'text-good' : 'text-warn'}>{report.validation_status}</strong></div>
        </div>
      </section>
    </main>
  );
}
