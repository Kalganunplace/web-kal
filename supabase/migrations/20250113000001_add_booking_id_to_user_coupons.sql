-- Add booking_id column to user_coupons table to track which booking used the coupon
ALTER TABLE user_coupons
ADD COLUMN booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_user_coupons_booking_id ON user_coupons(booking_id);

-- Add comment
COMMENT ON COLUMN user_coupons.booking_id IS 'The booking where this coupon was used';
