'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from './Pagination'

interface PaginationClientProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
}

export function PaginationClient({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
}: PaginationClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', newPageSize.toString())
    params.set('page', '1') // Reset to first page when changing page size
    router.push(`?${params.toString()}`)
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}
