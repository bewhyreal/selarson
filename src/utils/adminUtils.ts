import { supabase } from '../lib/supabase';

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // Get the current user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return false;

    // Check if the user is admin@example.com
    if (user.email === 'admin@example.com') {
      await ensureUserProfile(user.id, 'admin');
      return true;
    }
    
    // Check user metadata
    if (user.user_metadata?.role === 'admin') {
      await ensureUserProfile(user.id, 'admin');
      return true;
    }

    // Check profiles table as fallback
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      // If no profile exists, create one for admin@example.com
      if (user.email === 'admin@example.com') {
        await ensureUserProfile(user.id, 'admin');
        return true;
      }
      return false;
    }

    return profile.role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

async function ensureUserProfile(userId: string, role: string): Promise<void> {
  try {
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userId,
          role: role,
        }
      ], { 
        onConflict: 'id',
        update: { role: role }
      });

    if (upsertError) throw upsertError;
  } catch (err) {
    console.error('Error ensuring user profile:', err);
  }
}