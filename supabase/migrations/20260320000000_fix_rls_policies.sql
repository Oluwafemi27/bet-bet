-- Add policy to allow service role (admin) to create profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can insert any profile (for setup/admin operations)
CREATE POLICY "Service role can create profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Service role can update any profile
CREATE POLICY "Service role can update profiles" ON public.profiles FOR UPDATE USING (true);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles RLS
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert any role (for setup/admin operations)
CREATE POLICY "Service role can create roles" ON public.user_roles FOR INSERT WITH CHECK (true);

-- Service role can update any role
CREATE POLICY "Service role can update roles" ON public.user_roles FOR UPDATE USING (true);
