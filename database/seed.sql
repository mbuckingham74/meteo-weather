-- Meteo App Database Seed Data
-- Sample locations for testing

-- Insert sample cities
INSERT INTO locations (city_name, country, country_code, state, latitude, longitude, coordinates, timezone, elevation) VALUES
('New York', 'United States', 'US', 'New York', 40.7128, -74.0060, ST_SRID(POINT(-74.0060, 40.7128), 4326), 'America/New_York', 10),
('London', 'United Kingdom', 'GB', NULL, 51.5074, -0.1278, ST_SRID(POINT(-0.1278, 51.5074), 4326), 'Europe/London', 11),
('Tokyo', 'Japan', 'JP', NULL, 35.6762, 139.6503, ST_SRID(POINT(139.6503, 35.6762), 4326), 'Asia/Tokyo', 40),
('Paris', 'France', 'FR', NULL, 48.8566, 2.3522, ST_SRID(POINT(2.3522, 48.8566), 4326), 'Europe/Paris', 35),
('Sydney', 'Australia', 'AU', 'New South Wales', -33.8688, 151.2093, ST_SRID(POINT(151.2093, -33.8688), 4326), 'Australia/Sydney', 58),
('Los Angeles', 'United States', 'US', 'California', 34.0522, -118.2437, ST_SRID(POINT(-118.2437, 34.0522), 4326), 'America/Los_Angeles', 71),
('Singapore', 'Singapore', 'SG', NULL, 1.3521, 103.8198, ST_SRID(POINT(103.8198, 1.3521), 4326), 'Asia/Singapore', 15),
('Dubai', 'United Arab Emirates', 'AE', NULL, 25.2048, 55.2708, ST_SRID(POINT(55.2708, 25.2048), 4326), 'Asia/Dubai', 16),
('Berlin', 'Germany', 'DE', NULL, 52.5200, 13.4050, ST_SRID(POINT(13.4050, 52.5200), 4326), 'Europe/Berlin', 34),
('Toronto', 'Canada', 'CA', 'Ontario', 43.6532, -79.3832, ST_SRID(POINT(-79.3832, 43.6532), 4326), 'America/Toronto', 76)
ON DUPLICATE KEY UPDATE city_name=city_name;
