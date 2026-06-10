-- Add Google Calendar fields to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Add Google Calendar fields and goal_id to public.tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Add index on goal_id for performance
CREATE INDEX IF NOT EXISTS tasks_goal_id_idx ON public.tasks(goal_id);
