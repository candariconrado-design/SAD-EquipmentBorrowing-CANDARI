import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://agydqpurvxwvfhcaluj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0V9kQrjGA-vFE63VzJ3tJA_oAuQrSXq';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
