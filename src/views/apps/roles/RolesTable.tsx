'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'
import { Alert } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn, FilterFnOption } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import CustomPagination from './CustomPagination'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { fetchAccounts, fetchRoles, createAccount, type AccountType, type PaginatedResponse, type RoleType } from './accountService'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<AccountType>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFnOption<AccountType> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const userStatusObj: { [key: string]: ThemeColor } = {
  '0': 'success',
  '1': 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper<AccountType>()

const RolesTable = () => {
  // States
  const [roleId, setRoleId] = useState<number | ''>('')
  const [roles, setRoles] = useState<RoleType[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<AccountType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<{message: string, password: string} | null>(null)
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_email: '',
    phone_number: '',
    sex: '0',
    status: '0',
    remark: '',
    roles: [] as number[]
  })

  // Hooks
  const { lang: locale } = useParams()

  // Load roles on component mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setError(null)
        const rolesList = await fetchRoles()
        setRoles(rolesList)
      } catch (err) {
        console.error('Error loading roles:', err)
        setError(err instanceof Error ? err.message : '加载角色列表失败')
      }
    }

    loadRoles()
  }, [])

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchAccounts({
          page: pagination.pageIndex + 1,
          size: pagination.pageSize,
          keyword: globalFilter,
          role_id: roleId === '' ? undefined : roleId
        })
        setData(response.list)
        setTotalRows(response.total)
        setTotalPages(response.pages)
      } catch (err) {
        console.error('Error loading accounts:', err)
        setError(err instanceof Error ? err.message : '加载账户列表失败')
        setData([])
        setTotalRows(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, roleId])

  const columns = useMemo<ColumnDef<AccountType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('account_name', {
        header: 'Account',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {row.original.avatar && (
              <CustomAvatar src={row.original.avatar} skin='light' size={34} />
            )}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.account_name}
              </Typography>
              <Typography variant='body2'>{row.original.account_email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('role_name', {
        header: 'Role',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography className='capitalize' color='text.primary'>
              {row.original.role_name || 'No Role'}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('phone_number', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.phone_number}
          </Typography>
        )
      }),
      columnHelper.accessor('sex', {
        header: 'Sex',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.sex === '0' ? 'Male' : row.original.sex === '1' ? 'Female' : 'Unknown'}
          </Typography>
        )
      }),
      columnHelper.accessor('account_email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.account_email}
          </Typography>
        )
      }),
      columnHelper.accessor('remark', {
        header: 'Remark',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.remark || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              className='capitalize'
              label={row.original.status === '0' ? 'Active' : 'Inactive'}
              size='small'
              color={userStatusObj[row.original.status]}
            />
          </div>
        )
      }),
      columnHelper.accessor('account_id', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link href={getLocalizedUrl(`/apps/user/view?id=${row.original.account_id}`, locale as Locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [locale]
  )

  const table = useReactTable<AccountType>({
    data,
    columns,
    state: {
      rowSelection,
      pagination,
      globalFilter
    },
    pageCount: totalPages,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true
  })

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1) // Convert 1-based to 0-based index
  }

  const handleCreateAccount = async () => {
    try {
      setCreateError(null)
      setCreateSuccess(null)
      
      const response = await createAccount(newAccount)
      
      // 显示成功消息和初始密码
      setCreateSuccess({
        message: '账户创建成功',
        password: response.initial_password
      })
      
      // 重置表单
      setNewAccount({
        account_name: '',
        account_email: '',
        phone_number: '',
        sex: '0',
        status: '0',
        remark: '',
        roles: []
      })
      
      // 刷新账户列表
      table.setPageIndex(0)
      
    } catch (err: any) {
      setCreateError(err.response?.data?.msg || '创建账户失败')
    }
  }

  if (loading) {
      return (
      <Card>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
      )
    }

  if (error) {
    return (
      <Card>
        <Alert severity='error' onClose={() => setError(null)} className='mb-4'>
          {error}
        </Alert>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {error && (
        <Alert severity='error' onClose={() => setError(null)} className='mb-4'>
          {error}
        </Alert>
      )}
      <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <Typography>Show</Typography>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              const newSize = Number(e.target.value)
              table.setPageSize(Math.min(newSize, 100))
            }}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
          <Typography>entries</Typography>
        </div>
        <div className='flex gap-4 flex-col !items-start max-sm:is-full sm:flex-row sm:items-center'>
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-plus' />}
            onClick={() => setOpenDialog(true)}
          >
            Add Account
          </Button>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='max-sm:is-full min-is-[250px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Account'
          />
          <CustomTextField
            select
            value={roleId}
            onChange={e => setRoleId(e.target.value === '' ? '' : Number(e.target.value))}
            id='roles-app-role-select'
            className='max-sm:is-full sm:is-[160px]'
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>All Roles</MenuItem>
            {roles.map(role => (
              <MenuItem key={role.role_id} value={role.role_id}>
                {role.role_name}
              </MenuItem>
            ))}
          </CustomTextField>
        </div>
      </CardContent>

      {/* Create Account Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity='error' onClose={() => setCreateError(null)} className='mb-4'>
              {createError}
            </Alert>
          )}
          {createSuccess && (
            <Alert severity='success' className='mb-4'>
              {createSuccess.message}
              <Typography variant='body2' className='mt-2'>
                Initial Password: <strong>{createSuccess.password}</strong>
              </Typography>
            </Alert>
          )}
          <div className='flex flex-col gap-4 mt-4'>
            <CustomTextField
              fullWidth
              label='Username'
              value={newAccount.account_name}
              onChange={e => setNewAccount(prev => ({ ...prev, account_name: e.target.value }))}
              required
            />
            <CustomTextField
              fullWidth
              label='Email'
              type='email'
              value={newAccount.account_email}
              onChange={e => setNewAccount(prev => ({ ...prev, account_email: e.target.value }))}
              required
            />
            <CustomTextField
              fullWidth
              label='Phone Number'
              value={newAccount.phone_number}
              onChange={e => setNewAccount(prev => ({ ...prev, phone_number: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={newAccount.sex}
                onChange={e => setNewAccount(prev => ({ ...prev, sex: e.target.value }))}
                label='Gender'
              >
                <MenuItem value='0'>Male</MenuItem>
                <MenuItem value='1'>Female</MenuItem>
                <MenuItem value='2'>Unknown</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newAccount.status}
                onChange={e => setNewAccount(prev => ({ ...prev, status: e.target.value }))}
                label='Status'
              >
                <MenuItem value='0'>Active</MenuItem>
                <MenuItem value='1'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={newAccount.roles}
                onChange={e => setNewAccount(prev => ({ ...prev, roles: e.target.value as number[] }))}
                label='Roles'
              >
                {roles.map(role => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <CustomTextField
              fullWidth
              label='Remark'
              multiline
              rows={3}
              value={newAccount.remark}
              onChange={e => setNewAccount(prev => ({ ...prev, remark: e.target.value }))}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleCreateAccount}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <div className='flex items-center justify-between'>
        <Typography className='px-6'>
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)} of {totalRows} entries
        </Typography>
        <CustomPagination
          currentPage={pagination.pageIndex + 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      />
      </div>
    </Card>
  )
}

export default RolesTable
