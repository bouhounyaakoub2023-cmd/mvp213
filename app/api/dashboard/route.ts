import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Report } from '@/lib/types';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('industrial_reports')
      .select('id,plant_code,period_start,period_end,record_count,validation_status,kpi_data,exceptions_data,report_text,created_at')
      .order('period_end', { ascending: false })
      .limit(60);

    if (error) throw error;
    return NextResponse.json({ success: true, reports: (data ?? []) as Report[] });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load industrial reports' }, { status: 500 });
  }
}
