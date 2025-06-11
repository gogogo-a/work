'use client'

import { useMemo } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }: CustomPaginationProps) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis')
      }
      
      // Calculate start and end of the middle section
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = 4
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }, [currentPage, totalPages])

  return (
    <div className='flex items-center gap-2 py-4 px-6'>
      <IconButton 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
        size='small'
      >
        <i className='tabler-chevrons-left text-xl' />
      </IconButton>
      
      <IconButton 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        size='small'
      >
        <i className='tabler-chevron-left text-xl' />
      </IconButton>

      <div className='flex items-center gap-1'>
        {pageNumbers.map((pageNum, index) => (
          pageNum === 'ellipsis' ? (
            <Typography key={`ellipsis-${index}`} className='px-2'>...</Typography>
          ) : (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'contained' : 'text'}
              onClick={() => onPageChange(pageNum)}
              size='small'
              className='min-w-[32px] px-2'
            >
              {pageNum}
            </Button>
          )
        ))}
      </div>

      <IconButton 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        size='small'
      >
        <i className='tabler-chevron-right text-xl' />
      </IconButton>
      
      <IconButton 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        size='small'
      >
        <i className='tabler-chevrons-right text-xl' />
      </IconButton>
    </div>
  )
}

export default CustomPagination 