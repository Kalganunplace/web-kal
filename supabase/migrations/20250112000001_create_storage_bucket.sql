-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read all images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy: Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage all images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy: Allow admins to manage images (based on admin table)
CREATE POLICY "Admins can manage images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy: Users can update their own uploads
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'images' AND owner = auth.uid());

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());
