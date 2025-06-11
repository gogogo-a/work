'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'

interface TablePaginationComponentProps {
  table: any
  total: number
  page: number
  pageSize: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
}

const TablePaginationComponent = ({
  table,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}: TablePaginationComponentProps) => {
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize)

  // 当总页数变化时，确保当前页不超过总页数
  useEffect(() => {
    if (page >= totalPages) {
      onPageChange(Math.max(0, totalPages - 1))
    }
  }, [totalPages, page, onPageChange])

  // 计算当前显示的记录范围
  const startIndex = page * pageSize + 1
  const endIndex = Math.min((page + 1) * pageSize, total)

  return (
    <Box
      className='flex items-center justify-between gap-4 px-6 py-4'
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography>
        {startIndex}-{endIndex} of {total}
      </Typography>

      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(event, newPage) => onPageChange(newPage - 1)}
        shape='rounded'
        color='primary'
        showFirstButton
        showLastButton
      />
    </Box>
  )
}

export default TablePaginationComponent 