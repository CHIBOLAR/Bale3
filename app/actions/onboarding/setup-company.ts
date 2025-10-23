'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface SetupCompanyParams {
  companyName: string;
  industry: string;
  warehouseName: string;
  warehouseLocation: string;
  phoneNumber?: string;
}

export async function setupCompany(params: SetupCompanyParams) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user already has a company (prevent duplicate onboarding)
    const { data: existingUser } = await supabase
      .from('users')
      .select('company_id, onboarding_completed')
      .eq('auth_user_id', user.id)
      .single();

    if (existingUser?.onboarding_completed) {
      console.log('User has already completed onboarding');
      return { success: true };
    }

    // 1. Create the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: params.companyName,
        industry: params.industry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error('Error creating company:', companyError);
      return { success: false, error: 'Failed to create company' };
    }

    console.log('✅ Company created:', company.id);

    // 2. Create the user record (or update if exists)
    if (existingUser) {
      // Update existing user record
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          company_id: company.id,
          role: 'admin',
          onboarding_completed: true,
          phone_number: params.phoneNumber || null,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', user.id);

      if (updateUserError) {
        console.error('Error updating user:', updateUserError);
        return { success: false, error: 'Failed to update user' };
      }
    } else {
      // Create new user record
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!.split('@')[0],
          company_id: company.id,
          role: 'admin',
          onboarding_completed: true,
          phone_number: params.phoneNumber || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertUserError) {
        console.error('Error creating user:', insertUserError);
        return { success: false, error: 'Failed to create user' };
      }
    }

    console.log('✅ User record created/updated');

    // 3. Create the first warehouse
    const { error: warehouseError } = await supabase
      .from('warehouses')
      .insert({
        name: params.warehouseName,
        location: params.warehouseLocation,
        company_id: company.id,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (warehouseError) {
      console.error('Error creating warehouse:', warehouseError);
      return { success: false, error: 'Failed to create warehouse' };
    }

    console.log('✅ Warehouse created');

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error in setupCompany:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
