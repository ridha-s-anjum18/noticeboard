# Campus Notice Board — Lab 10A

A full-stack Campus Notice Board built with React + Supabase + Vercel.

## Stack
- **Frontend**: React + Vite (Smartech-style dashboard UI)
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Hosting**: Vercel

## Local Setup

1. **Clone the repo and install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env.local`** (copy from the example):
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your Supabase URL and anon key.

3. **Run locally**:
   ```bash
   npm run dev
   ```

## Supabase Setup

Run these SQL commands in Supabase SQL Editor in order:

### 1. Create Tables
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notices (
  id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 2. Enable RLS and Policies
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can read notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Signed-in users can post" ON notices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notices" ON notices FOR DELETE USING (auth.uid() = user_id);
```

### 3. Auto-create Profile Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4. Enable Realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notices;
```

### 5. Auth Settings
- Authentication → Settings → Turn OFF Email Confirmations → Save

## Deploy to Vercel

1. Push to a public GitHub repo
2. Import repo in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy
5. In Supabase → Authentication → URL Configuration → set your Vercel URL as Site URL
