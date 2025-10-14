import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '../ProductForm'

export default async function AddProductPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, is_demo')
    .eq('auth_user_id', user.id)
    .single()

  // Demo users or non-admins cannot add products
  if (userError || userData?.is_demo) {
    redirect('/dashboard/products')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue mb-2">
          Create Product
        </h1>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Add a new product to your catalog
        </p>
      </div>

      {/* Form */}
      <ProductForm mode="create" />
    </div>
  )
}
