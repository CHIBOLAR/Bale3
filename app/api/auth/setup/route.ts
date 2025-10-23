import { NextResponse } from 'next/server'
import { setupNewUser } from '@/app/actions/auth/setup-new-user'

export async function POST() {
  try {
    const result = await setupNewUser()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Setup API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}
