import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibdvwntcahiodeujkozb.supabase.co';
const supabaseKey = 'sb_publishable_2GC65x_HBOaNT5sBDDxQVQ_RekXbw6G';

export const supabase = createClient(supabaseUrl, supabaseKey);
