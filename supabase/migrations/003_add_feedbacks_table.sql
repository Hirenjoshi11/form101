CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    service_id VARCHAR(100),
    service_name VARCHAR(255),
    feedback_type VARCHAR(50),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    status VARCHAR(50) DEFAULT 'NEW',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts into feedbacks" 
ON public.feedbacks FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow admins to view and update feedbacks"
ON public.feedbacks FOR ALL
TO public
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE auth_id = auth.uid() OR id = auth.uid()
    )
);
