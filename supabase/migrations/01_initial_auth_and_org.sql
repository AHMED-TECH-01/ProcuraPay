-- ==============================================================================
-- ProcuraPay AI — Initial Supabase Migration: Auth, Profiles, and Organizations
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles Table (References Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_valid_role CHECK (role IN ('OWNER', 'ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE', 'MEMBER')),
    CONSTRAINT unique_user_org UNIQUE (organization_id, user_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Organization Members Policies
CREATE POLICY "Members can view members of their organizations"
    ON public.organization_members FOR SELECT
    USING (
        organization_id IN (
            SELECT om.organization_id
            FROM public.organization_members om
            WHERE om.user_id = auth.uid()
        )
    );

-- Organizations Policies
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (
        id IN (
            SELECT om.organization_id
            FROM public.organization_members om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Organization owners and admins can update organization details"
    ON public.organizations FOR UPDATE
    USING (
        id IN (
            SELECT om.organization_id
            FROM public.organization_members om
            WHERE om.user_id = auth.uid() AND om.role IN ('OWNER', 'ADMIN')
        )
    );

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
