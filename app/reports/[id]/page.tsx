import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return <main style={{padding:40,fontFamily:'DM Sans, sans-serif'}}><Link href="/">← Back to dashboard</Link><h1>Report not found</h1></main>;

  const k = report.kpi_data || {};
  return (
    <main style={{maxWidth:1000,margin:'0 auto',padding:'36px 22px',fontFamily:'DM Sans, sans-serif',color:'#111827'}}>
      <Link href="/" style={{display:'inline-flex',gap:7,alignItems:'center',fontSize:13,color:'#344054',textDecoration:'none'}}><ArrowLeft size={15}/> Back to command center</Link>
      <div style={{marginTop:28,borderBottom:'1px solid #e6e9ee',paddingBottom:20}}>
        <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:700,color:'#1f8f5f'}}>Industrial management report</div>
        <h1 style={{fontFamily:'Space Grotesk, sans-serif',fontSize:30,margin:'8px 0'}}>{report.plant_code} · {report.period_start} — {report.period_end}</h1>
        <div style={{color:'#667085',fontSize:12}}>{report.record_count} validated production records · Status: {report.validation_status}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,margin:'20px 0'}}>
        {[['Target attainment',`${k.target_attainment ?? 0}%`],['Quality rate',`${k.quality_rate ?? 0}%`],['Downtime',`${k.downtime_minutes ?? 0} min`],['Production gap',String(k.production_gap ?? 0)]].map(([label,value])=><div key={label} style={{border:'1px solid #e6e9ee',borderRadius:10,padding:14}}><div style={{fontSize:10,color:'#667085'}}>{label}</div><strong style={{fontFamily:'Space Grotesk',fontSize:21}}>{value}</strong></div>)}
      </div>
      <section style={{border:'1px solid #e6e9ee',borderRadius:12,padding:'22px',lineHeight:1.65,fontSize:13}}>
        <h2 style={{fontFamily:'Space Grotesk',fontSize:17,marginTop:0}}>Management report</h2>
        {report.report_text ? <div dangerouslySetInnerHTML={{__html: report.report_text}} /> : <p style={{color:'#667085'}}>No formatted management report is stored for this period.</p>}
      </section>
      {report.exceptions_data.length > 0 && <section style={{marginTop:16,border:'1px solid #e6e9ee',borderRadius:12,padding:'20px'}}><h2 style={{fontFamily:'Space Grotesk',fontSize:15}}>Operational signals</h2>{report.exceptions_data.map((e,i)=><div key={`${e.record_id}-${i}`} style={{padding:'11px 0',borderTop:'1px solid #f0f2f5',fontSize:12}}><strong>{e.production_line_id} · {e.type.replaceAll('_',' ')}</strong><div style={{color:'#667085'}}>{e.message} · {e.shift} · {e.severity}</div></div>)}</section>}
    </main>
  );
}
