'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Types & API Imports
import { UserData, UpdateUserData, RoleType } from '../types'
import { updateUser, getRoles } from '../api'

interface Props {
  data: UserData
}

const UserViewRight = ({ data }: Props) => {
  // States
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allRoles, setAllRoles] = useState<RoleType[]>([])
  const [formData, setFormData] = useState<UpdateUserData>({
    account_name: data.account_name,
    account_email: data.account_email,
    phone_number: data.phone_number || '',
    sex: data.sex,
    status: data.status,
    remark: data.remark || '',
    roles: data.roles.map(r => r.role_id)
  })

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true)
        console.log('Starting to fetch roles...')
        const roles = await getRoles()
        console.log('Component received roles:', roles)
        setAllRoles(roles)
        console.log('Current user roles:', data.roles)
        console.log('Form data roles:', formData.roles)
      } catch (err: any) {
        console.error('Failed to fetch roles:', err)
        setError('Failed to fetch roles')
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  const handleChange = (field: keyof UpdateUserData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`Handling change for field ${field}:`, event.target.value)
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleRolesChange = (event: any) => {
    const newRoles = event.target.value as number[]
    console.log('Handling roles change:', newRoles)
    setFormData(prev => ({
      ...prev,
      roles: newRoles
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    console.log('Submitting form with data:', formData)

    try {
      await updateUser(data.account_id, formData)
      console.log('User updated successfully')
      setSuccess(true)
      setIsEditing(false)
    } catch (err: any) {
      console.error('Failed to update user:', err)
      setError(err.response?.data?.msg || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      account_name: data.account_name,
      account_email: data.account_email,
      phone_number: data.phone_number || '',
      sex: data.sex,
      status: data.status,
      remark: data.remark || '',
      roles: data.roles.map(r => r.role_id)
    })
    setIsEditing(false)
    setError(null)
  }

  return (
    <Card>
      <CardHeader
        title='Edit User Information'
        action={
          !isEditing ? (
            <Button variant='contained' onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : null
        }
      />
      <CardContent>
        {error && (
          <Alert severity='error' onClose={() => setError(null)} className='mbe-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess(false)} className='mbe-4'>
            User information updated successfully
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-6'>
            <TextField
              fullWidth
              label='Username'
              value={formData.account_name}
              onChange={handleChange('account_name')}
              disabled={!isEditing || loading}
            />
            <TextField
              fullWidth
              label='Email'
              value={formData.account_email}
              onChange={handleChange('account_email')}
              disabled={!isEditing || loading}
            />
            <TextField
              fullWidth
              label='Phone Number'
              value={formData.phone_number}
              onChange={handleChange('phone_number')}
              disabled={!isEditing || loading}
            />
            <TextField
              select
              fullWidth
              label='Gender'
              value={formData.sex}
              onChange={handleChange('sex')}
              disabled={!isEditing || loading}
            >
              <MenuItem value='0'>Male</MenuItem>
              <MenuItem value='1'>Female</MenuItem>
              <MenuItem value='2'>Unknown</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label='Status'
              value={formData.status}
              onChange={handleChange('status')}
              disabled={!isEditing || loading}
            >
              <MenuItem value='0'>Active</MenuItem>
              <MenuItem value='1'>Inactive</MenuItem>
            </TextField>
            
            {/* Role selection */}
            <Box>
              <Typography variant='subtitle2' className='mbe-2'>
                Current Roles
              </Typography>
              <Box className='flex flex-wrap gap-2 mbe-4'>
                {data.roles.map(role => (
                  <Chip
                    key={`current-role-${role.role_id}`}
                    label={role.role_name}
                    color={role.role_status === '0' ? 'primary' : 'default'}
                    size='small'
                  />
                ))}
              </Box>
              <FormControl fullWidth disabled={!isEditing || loading || loadingRoles}>
                <InputLabel>Modify Roles</InputLabel>
                <Select
                  multiple
                  value={formData.roles}
                  onChange={handleRolesChange}
                  renderValue={(selected) => (
                    <Box className='flex flex-wrap gap-2'>
                      {selected.map((roleId) => {
                        const role = allRoles.find(r => r.role_id === roleId)
                        return role ? (
                          <Chip
                            key={`selected-role-${roleId}`}
                            label={role.role_name}
                            color={role.status === '0' ? 'primary' : 'default'}
                            size='small'
                          />
                        ) : null
                      })}
                    </Box>
                  )}
                >
                  {loadingRoles ? (
                    <MenuItem disabled>
                      <Box className='flex items-center gap-2 p-2'>
                        <CircularProgress size={20} />
                        <Typography>Loading roles...</Typography>
                      </Box>
                    </MenuItem>
                  ) : allRoles.length > 0 ? (
                    allRoles.map(role => (
                      <MenuItem key={`menu-role-${role.role_id}`} value={role.role_id}>
                        {role.role_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label='Remarks'
              value={formData.remark}
              onChange={handleChange('remark')}
              disabled={!isEditing || loading}
            />
          </div>
          {isEditing && (
            <Box className='flex justify-end gap-4 mt-6'>
              <Button variant='outlined' onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default UserViewRight 