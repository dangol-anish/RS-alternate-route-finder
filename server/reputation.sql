-- Add reputation column to profiles
ALTER TABLE public.profiles 
ADD COLUMN reputation INTEGER DEFAULT 0,
ADD COLUMN last_verification TIMESTAMP WITH TIME ZONE;

-- Create table for verification cooldowns
CREATE TABLE public.verification_cooldowns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    obstacle_id UUID REFERENCES public.obstacles(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('verify', 'dispute')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, obstacle_id)
);

-- Add RLS policies
ALTER TABLE public.verification_cooldowns ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own cooldowns
CREATE POLICY "Users can view their own cooldowns"
    ON public.verification_cooldowns
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own cooldowns
CREATE POLICY "Users can create their own cooldowns"
    ON public.verification_cooldowns
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to check if a user is on cooldown
CREATE OR REPLACE FUNCTION public.is_user_on_cooldown(
    p_user_id UUID,
    p_obstacle_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_action_time TIMESTAMP WITH TIME ZONE;
    cooldown_period INTERVAL := INTERVAL '30 seconds';
BEGIN
    SELECT created_at INTO last_action_time
    FROM public.verification_cooldowns
    WHERE user_id = p_user_id AND obstacle_id = p_obstacle_id;

    IF last_action_time IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN (NOW() - last_action_time) < cooldown_period;
END;
$$; 