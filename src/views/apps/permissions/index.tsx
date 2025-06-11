'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'
import type { ButtonProps } from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

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
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { TablePermission } from './permissionService'

// Component Imports
import PermissionDialog from '@components/dialogs/permission-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from './TablePaginationComponent'

// Service Imports
import { permissionService } from './permissionService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type Colors = {
  [key: string]: ThemeColor
}

// Vars
const colors: Colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
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

// Column Definitions
const columnHelper = createColumnHelper<TablePermission>()

const Permissions = () => {
  // States
  const [open, setOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [unconfiguredTables, setUnconfiguredTables] = useState<{ table_name: string; table_comment: string }[]>([])
  const [selectedTable, setSelectedTable] = useState<{ name: string; desc: string } | null>(null)
  const [newDesc, setNewDesc] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState<string>('')
  const [data, setData] = useState<TablePermission[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [totalPages, setTotalPages] = useState(0)

  // 加载权限数据
  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await permissionService.getTablePermissions(page + 1, pageSize, globalFilter)
      if (response.code === 200) {
        setData(response.data.list)
        setTotal(response.data.total)
        setTotalPages(response.data.total_pages)
        if (page >= response.data.total_pages) {
          setPage(Math.max(0, response.data.total_pages - 1))
        }
      }
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载未配置的表
  const loadUnconfiguredTables = async () => {
    try {
      const response = await permissionService.getUnconfiguredTables()
      if (response.code === 200) {
        setUnconfiguredTables(response.data)
      }
    } catch (error) {
      console.error('Failed to load unconfigured tables:', error)
    }
  }

  // 处理添加表权限
  const handleAddTable = async (tableName: string, tableDesc: string) => {
    try {
      const response = await permissionService.updateTablePermission({
        table_name: tableName,
        table_desc: tableDesc || tableName, // 如果没有描述，使用表名作为描述
        role_names: [], // 初始时没有角色分配
        permissions: {
          can_read: false,
          can_create: false,
          can_update: false,
          can_delete: false
        }
      })

      if (response.code === 200) {
        setAddDialogOpen(false)
        loadPermissions()
      } else {
        alert(response.msg || '添加失败')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg || '添加失败')
    }
  }

  // 当页码、每页数量或搜索条件变化时重新加载数据
  useEffect(() => {
    loadPermissions()
  }, [page, pageSize, globalFilter])

  // 处理编辑表描述
  const handleEditDesc = (name: string, desc: string) => {
    setSelectedTable({ name, desc })
    setNewDesc(desc)
    setEditDialogOpen(true)
  }

  // 处理删除表
  const handleDeleteTable = async (name: string) => {
    try {
      if (!window.confirm(`确定要删除表 ${name} 及其所有权限配置吗？`)) {
        return
      }

      const response = await permissionService.deleteTable(name)
      if (response.code === 200) {
        // 重新加载数据
        loadPermissions()
      } else {
        alert(response.msg || '删除失败')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg || '删除失败')
    }
  }

  // 保存表描述
  const handleSaveDesc = async () => {
    if (!selectedTable) return

    try {
      const response = await permissionService.updateTableDesc({
        table_name: selectedTable.name,
        table_desc: newDesc
      })

      if (response.code === 200) {
        setEditDialogOpen(false)
        // 重新加载数据
        loadPermissions()
      } else {
        alert(response.msg || '更新失败')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg || '更新失败')
    }
  }

  // 当点击添加权限按钮时
  const handleAddPermissionClick = async () => {
    await loadUnconfiguredTables()
    setAddDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<TablePermission, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography className='text-[22px]'>
              <i className='tabler-file text-textPrimary' />
            </Typography>
            <Typography
              component='a'
              onClick={() => handleEditPermission(row.original.name)}
              className='text-textPrimary cursor-pointer'
            >
              {row.original.name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('table_desc', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography className='text-textPrimary'>
            {row.original.table_desc}
          </Typography>
        )
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-2'>
            {row.original.assignedTo.map((role, index) => (
              <Chip
                key={index}
                label={role}
                color='primary'
                variant='tonal'
                size='small'
              />
            ))}
          </div>
        )
      }),
      columnHelper.accessor('createdDate', {
        header: 'Created Date',
        cell: ({ row }) => row.original.createdDate
      }),
      columnHelper.accessor('permissions', {
        header: 'Actions',
        cell: ({ row }) => {
          const { can_read, can_create, can_update, can_delete } = row.original.permissions

          return (
            <div className='flex items-center gap-4'>
              {/* <div className='flex items-center gap-2'>
                <Chip 
                  label='Read' 
                  color={can_read ? 'info' : 'default'} 
                  variant='tonal' 
                  size='small'
                  className={!can_read ? 'opacity-60' : ''}
                />
                <Chip 
                  label='Write' 
                  color={can_create ? 'success' : 'default'} 
                  variant='tonal' 
                  size='small'
                  className={!can_create ? 'opacity-60' : ''}
                />
                <Chip 
                  label='Update' 
                  color={can_update ? 'warning' : 'default'} 
                  variant='tonal' 
                  size='small'
                  className={!can_update ? 'opacity-60' : ''}
                />
                <Chip 
                  label='Delete' 
                  color={can_delete ? 'error' : 'default'} 
                  variant='tonal' 
                  size='small'
                  className={!can_delete ? 'opacity-60' : ''}
                />
              </div> */}
              <div className='flex items-center'>
                <IconButton onClick={() => handleEditDesc(row.original.name, row.original.table_desc)}>
                  <i className='tabler-edit text-textSecondary' />
                </IconButton>
                <IconButton onClick={() => handleDeleteTable(row.original.name)}>
                  <i className='tabler-trash text-textSecondary' />
                </IconButton>
              </div>
            </div>
          )
        }
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 15
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleEditPermission = (name: string) => {
    setOpen(true)
    setEditValue(name)
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap items-center justify-between gap-4 p-6'>
          <div className='flex items-center gap-2'>
            <Typography>Show</Typography>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                const newSize = parseInt(e.target.value, 10)
                setPageSize(Math.min(newSize, 15))
                setPage(0)
              }}
              className='is-[70px]'
            >
              <MenuItem value='5'>5</MenuItem>
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
            </CustomTextField>
          </div>
          <div className='flex flex-wrap gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Permissions'
              className='max-sm:is-full'
            />
            <Button
              variant='contained'
              onClick={handleAddPermissionClick}
              className='max-sm:is-full'
              startIcon={<i className='tabler-plus' />}
            >
              Add Permission
            </Button>
          </div>
        </div>
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
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Loading...
                  </td>
                </tr>
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
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
        <TablePaginationComponent
          table={table}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={newPage => setPage(newPage)}
          onPageSizeChange={newSize => {
            setPageSize(Math.min(newSize, 15))
            setPage(0)
          }}
        />
      </Card>

      {/* 编辑描述对话框 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>编辑表描述</DialogTitle>
        <DialogContent>
          <Alert severity='info' className='mbe-4'>
            只能修改表的描述信息，表名和其他信息不可更改。
          </Alert>
          <CustomTextField
            fullWidth
            label='表描述'
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color='secondary'>
            取消
          </Button>
          <Button onClick={handleSaveDesc} variant='contained'>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加表权限对话框 */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>添加表权限</DialogTitle>
        <DialogContent>
          <Alert severity='info' className='mbe-4'>
            选择一个未配置的表来添加权限配置。
          </Alert>
          {unconfiguredTables.length === 0 ? (
            <Typography>没有未配置的表</Typography>
          ) : (
            <div className='flex flex-col gap-4'>
              {unconfiguredTables.map((table) => (
                <Card key={table.table_name} variant='outlined'>
                  <CardContent className='flex items-center justify-between'>
                    <div>
                      <Typography variant='subtitle1'>{table.table_name}</Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {table.table_comment || '无描述'}
                      </Typography>
                    </div>
                    <Button
                      variant='contained'
                      size='small'
                      onClick={() => handleAddTable(table.table_name, table.table_comment)}
                    >
                      添加
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color='secondary'>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <PermissionDialog 
        open={open} 
        setOpen={setOpen} 
        data={editValue} 
        onSave={loadPermissions}
      />
    </>
  )
}

export default Permissions
