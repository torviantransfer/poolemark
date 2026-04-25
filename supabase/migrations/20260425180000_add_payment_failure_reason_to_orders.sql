-- Add payment failure reason and code to orders
ALTER TABLE orders
ADD COLUMN payment_failure_code text,
ADD COLUMN payment_failure_reason text;
