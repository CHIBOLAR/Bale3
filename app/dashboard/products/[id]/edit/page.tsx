import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user details to find company_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id, role, is_demo')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Company not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Check if demo mode
  if (userData.is_demo) {
    redirect(`/dashboard/products/${params.id}`)
  }

  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .single()

  if (productError || !product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue">
            Edit Product
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Update product information
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm product={product} />
    </div>
  )
}
