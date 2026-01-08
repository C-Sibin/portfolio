-- Tighten file upload permissions so ONLY admins can upload/manage objects in our buckets
-- (Fixes: "new row violates row-level security policy" on image upload)

-- project-images
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project images" ON storage.objects;

CREATE POLICY "Admins can upload project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "Admins can update project images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND public.is_admin());

CREATE POLICY "Admins can delete project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-images' AND public.is_admin());

-- blog-images
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin());

-- resumes
DROP POLICY IF EXISTS "Admins can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete resumes" ON storage.objects;

CREATE POLICY "Admins can upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes' AND public.is_admin());

CREATE POLICY "Admins can update resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes' AND public.is_admin());

CREATE POLICY "Admins can delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND public.is_admin());

-- skill-logos
DROP POLICY IF EXISTS "Admins can upload skill logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update skill logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete skill logos" ON storage.objects;

CREATE POLICY "Admins can upload skill logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'skill-logos' AND public.is_admin());

CREATE POLICY "Admins can update skill logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'skill-logos' AND public.is_admin());

CREATE POLICY "Admins can delete skill logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'skill-logos' AND public.is_admin());
