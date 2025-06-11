'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import { useTheme } from '@mui/material/styles'

// Axios Import
import axios from '@/utils/axios'

interface UserInfo {
  account_id: number
  account_name: string
  account_email: string
  phone_number: string | null
  sex: '0' | '1' | '2'
  avatar: string | null
  status: '0' | '1'
  login_ip: string | null
  login_date: string | null
  create_time: string
  update_time: string
  remark: string | null
  roles: Array<{
    role_id: number
    role_name: string
    role_status: '0' | '1'
  }>
}

const AccountProfile = () => {
  const theme = useTheme()
  const [accountInfo, setAccountInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    account_name: '',
    sex: '0'
  })

  useEffect(() => {
    fetchAccountInfo()
  }, [])

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get('/account/info/')
      setAccountInfo(response.data.data)
      setEditData({
        account_name: response.data.data.account_name,
        sex: response.data.data.sex
      })
    } catch (error) {
      console.error('Failed to fetch account info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (accountInfo) {
      setEditData({
        account_name: accountInfo.account_name,
        sex: accountInfo.sex
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await axios.put('/account/info/', editData)
      await fetchAccountInfo()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update account info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
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

  if (!accountInfo) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Failed to fetch account information</Typography>
        </CardContent>
      </Card>
    )
  }

  const getSexText = (sex: '0' | '1' | '2') => {
    const sexMap = {
      '0': 'Male',
      '1': 'Female',
      '2': 'Unknown'
    }
    return sexMap[sex]
  }

  const getStatusColor = (status: '0' | '1') => {
    return status === '0' ? 'success' : 'error'
  }

  const getStatusText = (status: '0' | '1') => {
    return status === '0' ? 'Active' : 'Disabled'
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {/* Basic Account Information */}
          <Grid item xs={12}>
            <Box className='flex items-center gap-4'>
              <Box className='relative'>
                <img
                  src={accountInfo.avatar || '/images/avatars/1.png'}
                  alt='Account Avatar'
                  className='rounded-full'
                  width={120}
                  height={120}
                />
                <Chip
                  label={getStatusText(accountInfo.status)}
                  color={getStatusColor(accountInfo.status)}
                  size="small"
                  className='absolute bottom-0 right-0'
                />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                {isEditing ? (
                  <Box className='flex flex-col gap-4'>
                    <TextField
                      fullWidth
                      label="Username"
                      value={editData.account_name}
                      onChange={handleChange('account_name')}
                      disabled={loading}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Gender"
                      value={editData.sex}
                      onChange={handleChange('sex')}
                      disabled={loading}
                    >
                      <MenuItem value="0">Male</MenuItem>
                      <MenuItem value="1">Female</MenuItem>
                      <MenuItem value="2">Unknown</MenuItem>
                    </TextField>
                  </Box>
                ) : (
                  <>
                    <Box className='flex items-center gap-2'>
                      <Typography variant='h5' className='mbe-2'>
                        {accountInfo.account_name}
                      </Typography>
                      <IconButton 
                        onClick={handleEdit}
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': { backgroundColor: 'rgba(145, 85, 253, 0.08)' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography className='mbe-1' color="text.secondary">
                      {accountInfo.account_email}
                    </Typography>
                    <Typography color="text.secondary">
                      Gender: {getSexText(accountInfo.sex)}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            {isEditing && (
              <Box className='flex justify-end gap-4 mt-4'>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save
                </Button>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Role Information */}
          <Grid item xs={12}>
            <Typography variant='h6' className='mbe-4'>
              Role Information
            </Typography>
            <Box className='flex flex-wrap gap-2'>
              {accountInfo.roles.map(role => (
                <Chip
                  key={role.role_id}
                  label={role.role_name}
                  color={role.role_status === '0' ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12}>
            <Typography variant='h6' className='mbe-4'>
              Detailed Information
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle2' className='mbe-1'>
                  Last Login IP
                </Typography>
                <Typography>{accountInfo.login_ip || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle2' className='mbe-1'>
                  Last Login Time
                </Typography>
                <Typography>
                  {accountInfo.login_date ? new Date(accountInfo.login_date).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle2' className='mbe-1'>
                  Created Time
                </Typography>
                <Typography>{new Date(accountInfo.create_time).toLocaleString()}</Typography>
              </Grid>
              {accountInfo.remark && (
                <Grid item xs={12}>
                  <Typography variant='subtitle2' className='mbe-1'>
                    Remarks
                  </Typography>
                  <Typography>{accountInfo.remark}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AccountProfile