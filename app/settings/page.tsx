import Link from 'next/link';
import { ArrowLeft, Database, GitBranch, LockKeyhole, Workflow } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="report-page">
      <div className="report-topbar">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to command center</Link>
        <span className="report-status valid">SYSTEM CONFIGURATION</span>
      </div>

      <header className="report-header">
        <div className="report-eyebrow"><Workflow size={13} /> Reporting infrastructure</div>
        <h1>Configuration</h1>
        <p className="report-period">How this command center is connected to the reporting pipeline.</p>
      </header>

      <section className="report-card report-data settings-card">
        <div className="report-card-head">
          <div><span className="card-eyebrow">Architecture</span><h2>Production reporting layer</h2></div>
        </div>
        <div className="report-data-grid settings-grid">
          <div><Database size={15} /><span>Data source</span><strong>Supabase · industrial_reports</strong></div>
          <div><Workflow size={15} /><span>Automation</span><strong>n8n scheduled reporting workflow</strong></div>
          <div><GitBranch size={15} /><span>Application</span><strong>Next.js management dashboard</strong></div>
          <div><LockKeyhole size={15} /><span>Access model</span><strong>Server-side database access</strong></div>
        </div>
      </section>

      <section className="report-card report-analysis settings-card">
        <div className="report-card-head">
          <div><span className="card-eyebrow">Pipeline contract</span><h2>What the dashboard expects</h2></div>
        </div>
        <div className="settings-list">
          <div><strong>1. Validate</strong><span>Production records must pass the reporting validation gate before AI analysis.</span></div>
          <div><strong>2. Analyze</strong><span>The industrial analysis layer produces management findings from validated facts.</span></div>
          <div><strong>3. Format</strong><span>The report editor converts the analysis into an email-ready management report.</span></div>
          <div><strong>4. Store</strong><span>Validated KPIs, exceptions, period metadata, and the formatted report are persisted.</span></div>
          <div><strong>5. Visualize</strong><span>This command center reads stored reports and exposes operational trends and signals.</span></div>
        </div>
      </section>
    </main>
  );
}
