# Setting Up Supabase for Oregon Fail Global Counter

This document provides instructions on how to set up Supabase to enable the global play counter feature in Oregon Fail.

## 1. Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for a free account.
2. Create a new project and give it a name (e.g., "Oregon Fail").
3. Note down your project URL and anon key (public API key).

## 2. Create the Counter Table

1. In your Supabase dashboard, go to the "Table Editor" section.
2. Click "Create a new table" and name it `game_counters`.
3. Add the following columns:
   - `id` (type: text, primary key)
   - `count` (type: int8, default: 0)
   - `created_at` (type: timestamptz, default: now())
   - `updated_at` (type: timestamptz, default: now())

4. Click "Save" to create the table.

## 3. Set Up Row-Level Security (RLS)

For security, we need to set up Row-Level Security policies:

1. Go to the "Authentication" > "Policies" section.
2. Find your `game_counters` table and enable RLS.
3. Add the following policies:

### Read Policy (Allow anyone to read)

- Policy name: `Allow public read`
- Target roles: `anon, authenticated`
- Using expression: `true`
- Definition: `SELECT`

### Update Policy (Allow updates to existing rows only)

- Policy name: `Allow public update`
- Target roles: `anon, authenticated`
- Using expression: `true`
- Definition: `UPDATE`

### Insert Policy (Allow inserts)

- Policy name: `Allow public insert`
- Target roles: `anon, authenticated`
- Using expression: `true`
- Definition: `INSERT`

## 4. Update the Supabase Configuration

1. Open the `supabase.js` file in your project.
2. Replace the placeholder values with your actual Supabase URL and anon key:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

## 5. Initialize the Counter

1. In the Supabase Table Editor, manually add a row to the `game_counters` table:
   - `id`: `oregon_fail_counter`
   - `count`: `0` (or any starting number you prefer)

## 6. Testing

1. Open your game in a browser and check the developer console for any errors.
2. The counter should display on the title screen.
3. Each time a new game starts, the counter should increment.

## Troubleshooting

- If the counter doesn't display, check the browser console for errors.
- Verify that your Supabase URL and key are correct.
- Make sure the RLS policies are properly set up.
- Check that the `game_counters` table has the correct structure.

## Additional Notes

- The free tier of Supabase has usage limits. For a small game, this should be more than sufficient.
- Consider adding error handling to gracefully handle cases where Supabase might be unavailable.
- You can view the counter's value directly in the Supabase Table Editor. 