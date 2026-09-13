'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Factory, FileText, LayoutDashboard, RefreshCw, Settings2 } from 'lucide-react';
import { Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Report } from '@/lib/types';

const fmt = (n: number | undefined) => new Intl.NumberFormat('en-US').format(n ?? 0);
const pct = (n: number | undefined) => `${(n ?? 0).toFixed(1)}%`;
const dateLabel = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));

function demoInsight(report: Report | undefined) {
  if (!report) return 'No report has been ingested yet. Connect the reporting workflow to start the operational view.';
  const exceptions = report.exceptions_data ?? [];
  if (!exceptions.length) return 'The latest reporting period contains no detected exceptions. Operations are within the configured thresholds.';
  const high = exceptions.filter(e => e.severity === 'HIGH').length;
  return `${exceptions.length} exception${exceptions.length > 1 ? 's' : ''} require attention in the latest period${high ? `, including ${high} high-severity signal${high > 1 ? 's' : ''}` : ''}.`;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load reports');
      setReports(json.reports || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const latest = reports[0];
  const kpi = latest?.kpi_data || {};
  const exceptions = latest?.exceptions_data || [];

  const trend = useMemo(() => [...reports].reverse().map(r => ({
    period: dateLabel(r.period_end), attainment: Number(r.kpi_data?.target_attainment ?? 0), quality: Number(r.kpi_data?.quality_rate ?? 0), downtime: Number(r.kpi_data?.downtime_minutes ?? 0)
  })), [reports]);

  const production = latest ? [
    { name: 'Target', value: latest.kpi_data?.target_units ?? 0 },
    { name: 'Produced', value: latest.kpi_data?.produced_units ?? 0 },
    { name: 'Good', value: latest.kpi_data?.good_units ?? 0 },
  ] : [];

  const lineExceptions = useMemo(() => {
    const map = new Map<string, number>();
    exceptions.forEach(e => map.set(e.production_line_id, (map.get(e.production_line_id) || 0) + 1));
    return [...map.entries()].map(([line, count]) => ({ line, count })).sort((a,b) => b.count-a.count);
  }, [exceptions]);

  const severity = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    exceptions.forEach(e => counts[e.severity]++);
    return Object.entries(counts).filter(([, value]) => value > 0).map(([name, value]) => ({ name, value }));
  }, [exceptions]);

  if (loading) return <div className="loading">Loading operational intelligence…</div>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">IO</div><div className="brand-copy"><strong>Industrial Ops</strong><span>Command Center</span></div></div>
        <nav className="nav">
          <a className="active" href="#overview"><LayoutDashboard size={16}/><span>Overview</span></a>
          <a href="#performance"><BarChart3 size={16}/><span>Performance</span></a>
          <a href="#reports"><FileText size={16}/><span>Reports</span></a>
          <a href="#settings"><Settings2 size={16}/><span>Configuration</span></a>
        </nav>
        <div className="side-foot">Operational intelligence<br/>Automated reporting layer</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">Operations intelligence</div><h1>Plant performance at a glance.</h1><p className="subtitle">A management view built from validated industrial reporting data.</p></div>
          <div className="actions"><span className="status">● LIVE DATA</span><button className="control" onClick={load}><RefreshCw size={13} style={{verticalAlign:'-2px'}}/> Refresh</button></div>
        </header>

        {error && <div className="panel error">{error}</div>}
        {!latest && !error && <div className="panel hero" style={{marginBottom:16}}><h2>Waiting for the first report</h2><p>Run the n8n reporting workflow once. This dashboard will automatically populate from <strong>industrial_reports</strong>; no numbers are hardcoded.</p></div>}

        {latest && <>
          <section className="hero-grid" id="overview">
            <div className="panel hero">
              <div className="hero-title"><div><div className="eyebrow">Latest operating period</div><h2>{latest.plant_code} · {dateLabel(latest.period_start)} — {dateLabel(latest.period_end)}</h2><p>{demoInsight(latest)}</p></div><div className="health"><strong>{pct(kpi.target_attainment)}</strong><span>target attainment</span></div></div>
              <div className="signal"><div><b>{pct(kpi.quality_rate)}</b><span>quality rate</span></div><div><b>{fmt(kpi.downtime_minutes)} min</b><span>downtime</span></div><div><b>{fmt(kpi.production_gap)}</b><span>production gap</span></div></div>
            </div>
            <div className="panel attention"><h3>Management attention</h3>{exceptions.length === 0 ? <div className="issue"><div className="dot" style={{background:'var(--green)'}}/><div><b>No active exceptions</b><span>Latest period is within configured thresholds.</span></div></div> : exceptions.slice(0,4).map((e,i)=><div className="issue" key={`${e.record_id}-${i}`}><div className={`dot ${e.severity !== 'HIGH' ? 'amber' : ''}`}/><div><b>{e.production_line_id} · {e.type.replaceAll('_',' ')}</b><span>{e.message} · {e.shift}</span></div></div>)}</div>
          </section>

          <section className="chart-grid" id="performance">
            <div className="panel chart-panel"><div className="chart-head"><div><h3>Performance trajectory</h3><p>Attainment and quality across reporting periods</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="period" tick={{fontSize:10}}/><YAxis domain={[80,100]} tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/><Tooltip formatter={(v:any)=>`${v}%`}/><Line type="monotone" dataKey="attainment" name="Target attainment" stroke="#1f8f5f" strokeWidth={2.5} dot={{r:3}}/><Line type="monotone" dataKey="quality" name="Quality rate" stroke="#344054" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer></div></div>
            <div className="panel chart-panel"><div className="chart-head"><div><h3>Latest production mix</h3><p>Target, produced and good units</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={production} margin={{top:15,right:8,left:-18,bottom:5}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>new Intl.NumberFormat('en-US',{notation:'compact'}).format(v)}/><Tooltip formatter={(v:any)=>fmt(Number(v))}/><Bar dataKey="value" radius={[5,5,0,0]} fill="#19324d"/></BarChart></ResponsiveContainer></div></div>
          </section>

          <section className="bottom-grid">
            <div className="panel chart-panel"><div className="chart-head"><div><h3>Exception concentration</h3><p>Where management signals are occurring</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={lineExceptions} layout="vertical" margin={{top:8,right:20,left:5,bottom:5}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false} tick={{fontSize:10}}/><YAxis type="category" dataKey="line" tick={{fontSize:10}} width={58}/><Tooltip/><Bar dataKey="count" name="Exceptions" radius={[0,5,5,0]} fill="#c77b11"/></BarChart></ResponsiveContainer></div></div>
            <div className="panel table-panel" id="reports"><h3>Recent reporting periods</h3><table><thead><tr><th>Period</th><th>Attainment</th><th>Quality</th><th>Downtime</th><th>Signals</th></tr></thead><tbody>{reports.slice(0,8).map(r=><tr key={r.id}><td>{dateLabel(r.period_start)} — {dateLabel(r.period_end)}</td><td className={(r.kpi_data?.target_attainment ?? 0) >= 90 ? 'good':'bad'}>{pct(r.kpi_data?.target_attainment)}</td><td className={(r.kpi_data?.quality_rate ?? 0) >= 95 ? 'good':'warn'}>{pct(r.kpi_data?.quality_rate)}</td><td>{fmt(r.kpi_data?.downtime_minutes)} min</td><td>{r.exceptions_data?.length ?? 0}</td></tr>)}</tbody></table></div>
          </section>
        </>}
      </main>
    </div>
  );
}
