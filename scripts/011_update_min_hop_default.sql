-- Update min_hop_amount default from 0.10 to 0.50 and backfill existing rows
ALTER TABLE public.cascade_rules
  ALTER COLUMN min_hop_amount SET DEFAULT 0.50;

UPDATE public.cascade_rules
  SET min_hop_amount = 0.50
  WHERE min_hop_amount < 0.50;
