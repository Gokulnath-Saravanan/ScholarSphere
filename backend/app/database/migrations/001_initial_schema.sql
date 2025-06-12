-- Enable the necessary extensions
create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- Create the faculty table
create table if not exists faculty (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    title text,
    department text,
    institution text,
    email text,
    research_interests text[],
    profile_image text,
    full_text tsvector generated always as (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(department, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(research_interests, ' '), '')), 'C')
    ) stored,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create the publications table
create table if not exists publications (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    abstract text,
    authors text[],
    journal text,
    year integer,
    doi text,
    citations integer default 0,
    full_text tsvector generated always as (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(abstract, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(authors, ' '), '')), 'C')
    ) stored,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create the research_works table
create table if not exists research_works (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    researcher text not null,
    domain text,
    status text,
    keywords text[],
    funding text,
    full_text tsvector generated always as (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(researcher, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'C')
    ) stored,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for full-text search
create index if not exists faculty_full_text_idx on faculty using gin(full_text);
create index if not exists publications_full_text_idx on publications using gin(full_text);
create index if not exists research_works_full_text_idx on research_works using gin(full_text); 