-- Links Table
CREATE TABLE tracking_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs Table
CREATE TABLE tracking_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES tracking_links(id) ON DELETE CASCADE,
  
  -- Basic Info
  ip_address TEXT,
  user_agent TEXT,
  
  -- GPS Info (if permitted)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  gps_accuracy DOUBLE PRECISION,
  gps_permission BOOLEAN DEFAULT FALSE,
  
  -- Additional Environment Info
  battery_level DOUBLE PRECISION,
  battery_charging BOOLEAN,
  network_type TEXT,
  network_speed DOUBLE PRECISION,
  screen_width INTEGER,
  screen_height INTEGER,
  window_width INTEGER,
  window_height INTEGER,
  timezone TEXT,
  language TEXT,
  logical_cores INTEGER,
  device_memory DOUBLE PRECISION,
  
  -- Parsed UA Info (for easier search/filter later)
  os_name TEXT,
  os_version TEXT,
  browser_name TEXT,
  device_type TEXT,
  device_vendor TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
