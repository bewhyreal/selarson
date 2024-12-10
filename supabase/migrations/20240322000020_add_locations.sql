-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add locations array to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS locations TEXT[] DEFAULT '{}';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to locations" ON public.locations;
DROP POLICY IF EXISTS "Allow admin to manage locations" ON public.locations;

-- Create policies for locations
CREATE POLICY "Allow public read access to locations"
    ON public.locations FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage locations"
    ON public.locations FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid() 
            AND (
                raw_user_meta_data->>'role' = 'admin'
                OR email = 'admin@selargroup.com'
            )
        )
    );

-- Insert initial locations
INSERT INTO public.locations (name) VALUES
    ('İstanbul'),
    ('Ankara'),
    ('İzmir'),
    ('Antalya'),
    ('Bursa')
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.locations TO authenticated;