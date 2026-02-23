-- Rename stellar_address to recipient_username in cascade_dependencies
-- The contract's set_rules() expects Tippa usernames, not Stellar addresses.

ALTER TABLE public.cascade_dependencies
  RENAME COLUMN stellar_address TO recipient_username;
