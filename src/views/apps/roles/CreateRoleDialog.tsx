'use client'

import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import { getTableList, createRole, type TableInfo, type TablePermission } from './tableService'

interface CreateRoleDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CreateRoleDialog = ({ open, onClose, onSuccess }: CreateRoleDialogProps) => {
  // States
  const [roleName, setRoleName] = useState('')
  const [tables, setTables] = useState<TableInfo[]>([])
  const [permissions, setPermissions] = useState<TablePermission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Effects
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true)
        const tableList = await getTableList()
        setTables(tableList)
        // 初始化权限，所有权限默认为false
        setPermissions(
          tableList.map(table => ({
            table_name: table.table_name,
            can_read: false,
            can_create: false,
            can_update: false,
            can_delete: false
          }))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tables')
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchTables()
    }
  }, [open])

  // Handlers
  const handlePermissionChange = (
    tableIndex: number,
    permission: keyof Omit<TablePermission, 'table_name'>,
    checked: boolean
  ) => {
    setPermissions(prevPermissions => {
      const newPermissions = [...prevPermissions]
      newPermissions[tableIndex] = {
        ...newPermissions[tableIndex],
        [permission]: checked
      }
      return newPermissions
    })
  }

  // 全选/全不选处理函数
  const handleSelectAll = (permission: keyof Omit<TablePermission, 'table_name'>, checked: boolean) => {
    setPermissions(prevPermissions =>
      prevPermissions.map(perm => ({
        ...perm,
        [permission]: checked
      }))
    )
  }

  // 检查是否所有表都有某个权限
  const isAllSelected = (permission: keyof Omit<TablePermission, 'table_name'>) => {
    return permissions.every(perm => perm[permission])
  }

  // 检查是否部分表有某个权限
  const isPartiallySelected = (permission: keyof Omit<TablePermission, 'table_name'>) => {
    return permissions.some(perm => perm[permission]) && !permissions.every(perm => perm[permission])
  }

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      setError('Role name is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await createRole({
        role_name: roleName,
        permissions
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    } finally {
      setSubmitting(false)
    }
  }

  // Reset states when dialog closes
  const handleClose = () => {
    setRoleName('')
    setPermissions([])
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Role</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          fullWidth
          value={roleName}
          onChange={e => setRoleName(e.target.value)}
          className="mb-4"
        />
        {loading ? (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        ) : (
          <>
            {/* 全选/全不选区域 */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Global Permissions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllSelected('can_read')}
                        indeterminate={isPartiallySelected('can_read')}
                        onChange={(e, checked) => handleSelectAll('can_read', checked)}
                      />
                    }
                    label="Read All"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllSelected('can_create')}
                        indeterminate={isPartiallySelected('can_create')}
                        onChange={(e, checked) => handleSelectAll('can_create', checked)}
                      />
                    }
                    label="Create All"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllSelected('can_update')}
                        indeterminate={isPartiallySelected('can_update')}
                        onChange={(e, checked) => handleSelectAll('can_update', checked)}
                      />
                    }
                    label="Update All"
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllSelected('can_delete')}
                        indeterminate={isPartiallySelected('can_delete')}
                        onChange={(e, checked) => handleSelectAll('can_delete', checked)}
                      />
                    }
                    label="Delete All"
                  />
                </Grid>
              </Grid>
            </Box>
            {/* 表格权限列表 */}
            <Grid container spacing={4}>
              {tables.map((table, tableIndex) => (
                <Grid item xs={12} key={table.table_name}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {table.table_comment || table.table_name}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permissions[tableIndex]?.can_read || false}
                                onChange={(e, checked) => handlePermissionChange(tableIndex, 'can_read', checked)}
                              />
                            }
                            label="Read"
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permissions[tableIndex]?.can_create || false}
                                onChange={(e, checked) => handlePermissionChange(tableIndex, 'can_create', checked)}
                              />
                            }
                            label="Create"
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permissions[tableIndex]?.can_update || false}
                                onChange={(e, checked) => handlePermissionChange(tableIndex, 'can_update', checked)}
                              />
                            }
                            label="Update"
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permissions[tableIndex]?.can_delete || false}
                                onChange={(e, checked) => handlePermissionChange(tableIndex, 'can_delete', checked)}
                              />
                            }
                            label="Delete"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateRoleDialog 