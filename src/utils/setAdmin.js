// Utility script to set a user as an admin
import { supabase } from '../services/supabaseClient';

// Function to set a user as an admin by email
async function setUserAsAdmin(email) {
  try {
    // First, get the user by email
    const { data: users, error: fetchError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (!users) {
      console.error('User not found with email:', email);
      return { success: false, error: 'User not found' };
    }
    
    // Update the user's metadata to include isAdmin: true
    const { data, error } = await supabase.auth.admin.updateUserById(
      users.id,
      { user_metadata: { isAdmin: true } }
    );
    
    if (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
    
    console.log('User successfully set as admin:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
}

export { setUserAsAdmin };
