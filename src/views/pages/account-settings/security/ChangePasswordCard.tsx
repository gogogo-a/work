'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Icon Imports
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Axios Import
import axios from '@/utils/axios'

interface PasswordState {
  value: string
  showPassword: boolean
  error: string
}

const ChangePasswordCard = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState<PasswordState>({
    value: '',
    showPassword: false,
    error: ''
  })
  const [newPassword, setNewPassword] = useState<PasswordState>({
    value: '',
    showPassword: false,
    error: ''
  })
  const [confirmPassword, setConfirmPassword] = useState<PasswordState>({
    value: '',
    showPassword: false,
    error: ''
  })

  const handlePasswordChange = (field: 'current' | 'new' | 'confirm') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    switch (field) {
      case 'current':
        setCurrentPassword(prev => ({ ...prev, value, error: '' }))
        break
      case 'new':
        setNewPassword(prev => ({ ...prev, value, error: '' }))
        setConfirmPassword(prev => ({ ...prev, error: value !== confirmPassword.value ? 'Passwords do not match' : '' }))
        break
      case 'confirm':
        setConfirmPassword(prev => ({
          ...prev,
          value,
          error: value !== newPassword.value ? 'Passwords do not match' : ''
        }))
        break
    }
    setError('')
    setSuccess(false)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => () => {
    switch (field) {
      case 'current':
        setCurrentPassword(prev => ({ ...prev, showPassword: !prev.showPassword }))
        break
      case 'new':
        setNewPassword(prev => ({ ...prev, showPassword: !prev.showPassword }))
        break
      case 'confirm':
        setConfirmPassword(prev => ({ ...prev, showPassword: !prev.showPassword }))
        break
    }
  }

  const validateForm = () => {
    let isValid = true
    if (!currentPassword.value) {
      setCurrentPassword(prev => ({ ...prev, error: 'Current password is required' }))
      isValid = false
    }
    if (!newPassword.value) {
      setNewPassword(prev => ({ ...prev, error: 'New password is required' }))
      isValid = false
    } else if (newPassword.value.length < 8) {
      setNewPassword(prev => ({ ...prev, error: 'Password must be at least 8 characters long' }))
      isValid = false
    }
    if (!confirmPassword.value) {
      setConfirmPassword(prev => ({ ...prev, error: 'Please confirm your new password' }))
      isValid = false
    } else if (newPassword.value !== confirmPassword.value) {
      setConfirmPassword(prev => ({ ...prev, error: 'Passwords do not match' }))
      isValid = false
    }
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await axios.post('/account/info/', {
        current_password: currentPassword.value,
        new_password: newPassword.value,
        confirm_password: confirmPassword.value
      })

      setSuccess(true)
      setCurrentPassword(prev => ({ ...prev, value: '' }))
      setNewPassword(prev => ({ ...prev, value: '' }))
      setConfirmPassword(prev => ({ ...prev, value: '' }))
    } catch (err: any) {
      setError(err.response?.data?.msg || 'An error occurred while changing the password')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentPassword(prev => ({ ...prev, value: '', error: '' }))
    setNewPassword(prev => ({ ...prev, value: '', error: '' }))
    setConfirmPassword(prev => ({ ...prev, value: '', error: '' }))
    setError('')
    setSuccess(false)
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent>
        {error && (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mbe-4'>
            Password changed successfully
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Current Password'
                value={currentPassword.value}
                onChange={handlePasswordChange('current')}
                error={!!currentPassword.error}
                helperText={currentPassword.error}
                type={currentPassword.showPassword ? 'text' : 'password'}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={togglePasswordVisibility('current')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          {currentPassword.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='New Password'
                value={newPassword.value}
                onChange={handlePasswordChange('new')}
                error={!!newPassword.error}
                helperText={newPassword.error}
                type={newPassword.showPassword ? 'text' : 'password'}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={togglePasswordVisibility('new')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          {newPassword.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Confirm New Password'
                value={confirmPassword.value}
                onChange={handlePasswordChange('confirm')}
                error={!!confirmPassword.error}
                helperText={confirmPassword.error}
                type={confirmPassword.showPassword ? 'text' : 'password'}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={togglePasswordVisibility('confirm')}
                          onMouseDown={e => e.preventDefault()}
                        >
                          {confirmPassword.showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex flex-col gap-4'>
              <Typography variant='h6'>Password Requirements:</Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Minimum 8 characters long - the more, the better
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one lowercase & one uppercase character
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button
                variant='contained'
                type='submit'
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Save Changes
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
