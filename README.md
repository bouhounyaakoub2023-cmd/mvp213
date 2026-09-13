# Industrial Reporting Dashboard

Executive operations dashboard for the Automated Industrial Daily Reporting product.

## Product intent

This is not a KPI wall. The dashboard turns validated industrial reports into a management cockpit: trends, production comparison, exception concentration, and recent reporting history.

All displayed values are loaded from `public.industrial_reports`. No production numbers are hardcoded.

## Stack

- Next.js 16
- React 19
- TypeScript
- Recharts
- Supabase
- Lucide React

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Environment

Set:

```text
SUPABASE_URL=https://rwfedzwxternblpaypxi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Use the Supabase service-role secret only on the server. Never expose it through `NEXT_PUBLIC_*` variables or commit it to Git.

## Database contract

The dashboard reads these fields from `public.industrial_reports`:

- `id`
- `plant_code`
- `period_start`
- `period_end`
- `record_count`
- `validation_status`
- `kpi_data`
- `exceptions_data`
- `report_text`
- `created_at`

Expected KPI JSON keys:

```json
{
  "target_units": 12000,
  "produced_units": 11530,
  "good_units": 11245,
  "target_attainment": 96.1,
  "quality_rate": 97.5,
  "production_gap": 470,
  "downtime_minutes": 450
}
```

Expected exception objects include `production_line_id`, `shift`, `type`, `severity`, and `message`.

## Connect to the principal industrial-reporting project

The dashboard is intentionally isolated behind one API boundary:

```text
n8n
  ↓
industrial-reporting /api/report
  ↓
industrial-reporting /api/ai/report
  ↓
Supabase industrial_reports
  ↓
Dashboard /api/dashboard
  ↓
Management UI
```

### Integration option A — keep the dashboard as its own app

Recommended for the pilot. Deploy this repo separately and point it at the same Supabase project. Nothing in the reporting engine needs to move.

### Integration option B — merge into the principal Next.js app

Copy:

```text
app/page.tsx              → app/dashboard/page.tsx
app/api/dashboard/       → app/api/dashboard/
lib/types.ts             → lib/dashboard-types.ts (or merge types)
lib/supabase.ts          → reuse the principal server Supabase client
app/globals.css          → merge the dashboard CSS rules
```

Then install the dashboard-only dependencies if missing:

```bash
npm install recharts lucide-react @supabase/supabase-js
```

Do not copy the dashboard's `app/layout.tsx` into the principal project. Keep the principal project's root layout.

If the principal project already has Supabase server utilities, reuse them instead of creating a second client.

## Why the dashboard is structured this way

The reporting engine owns correctness and AI analysis. The dashboard owns presentation. This separation prevents visual changes from accidentally changing industrial calculations.

The visual layer should be renewed automatically as new reports arrive because every chart derives from the current report collection returned by `/api/dashboard`.

## Next product increments

1. Report detail view with the complete management report.
2. Date-range and plant filters.
3. Downtime and quality drill-downs when line-level production data is available.
4. Live/near-real-time refresh after workflow completion.
5. Authentication and role-based access before customer deployment.
