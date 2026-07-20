CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- seed data so the gallery isn't empty
INSERT INTO gallery_items (title, description, media_url, media_type, category)
VALUES
('Coastal Search & Rescue Demo', 'Fixed-wing VTOL locating a stranded hiker in under 8 minutes.', 'https://example.com/media/rescue-demo.mp4', 'video', 'emergency'),
('Crop Health Flyover', 'Multispectral pass over a 40-hectare wheat field.', 'https://example.com/media/crop-flyover.jpg', 'image', 'agriculture'),
('Rural Medical Delivery', 'Prototype delivering insulin to a clinic with no road access.', 'https://example.com/media/medical-delivery.jpg', 'image', 'delivery'),
('Bridge Inspection Pass', 'VTOL hovering under a bridge deck for close-up structural imaging.', 'https://example.com/media/bridge-inspection.mp4', 'video', 'inspection');