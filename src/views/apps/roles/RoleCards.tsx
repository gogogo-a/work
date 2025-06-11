'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Component Imports
import EditRoleDialog from './EditRoleDialog'
import CreateRoleDialog from './CreateRoleDialog'

// Service Imports
import { getRoleStats, type RoleCardData } from './roleService'

const RoleCards = () => {
  // States
  const [cardData, setCardData] = useState<RoleCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  // Effects
  useEffect(() => {
    fetchRoleStats()
  }, [])

  // Handlers
  const fetchRoleStats = async () => {
    try {
      setLoading(true)
      const data = await getRoleStats()
      setCardData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role data')
      console.error('Error fetching role stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    fetchRoleStats()
  }

  const handleEditSuccess = () => {
    fetchRoleStats()
  }

  const handleEditClick = (roleId: number) => {
    if (!roleId || roleId <= 0) {
      console.error('Invalid role ID:', roleId)
      setError('Invalid role ID')
      return
    }
    try {
      setSelectedRoleId(roleId)
      setEditDialogOpen(true)
      setError(null)  // 清除之前的错误
    } catch (err) {
      console.error('Error opening edit dialog:', err)
      setError('Failed to open edit dialog')
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Typography>Loading role data...</Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      {error && (
        <Grid container spacing={6} className="mbe-4">
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        </Grid>
      )}
      <Grid container spacing={6}>
        {cardData.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.id || index}>  {/* 使用 item.id 作为 key */}
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <Typography className='flex-grow'>{`Total ${item.totalUsers} accounts`}</Typography>
                  <AvatarGroup total={item.totalUsers}>
                    {item.avatars.map((img, index: number) => (
                      <Avatar key={index} alt={item.title} src={`/images/avatars/${img}`} />
                    ))}
                  </AvatarGroup>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col items-start gap-1'>
                    <Typography variant='h5'>{item.title}</Typography>
                    <Typography
                      component='span'
                      color='primary'
                      sx={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditClick(item.id)
                      }}
                    >
                      Edit Role
                    </Typography>
                  </div>
                  <IconButton>
                    <i className='tabler-copy text-secondary' />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card className="cursor-pointer bs-full" onClick={() => setCreateDialogOpen(true)}>
            <Grid container className='bs-full'>
              <Grid size={{ xs: 5 }}>
                <div className='flex items-end justify-center bs-full'>
                  <img alt='add-role' src='/images/illustrations/characters/5.png' height={130} />
                </div>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <CardContent>
                  <div className='flex flex-col items-end gap-4 text-right'>
                    <Button variant='contained' size='small'>
                      Add Role
                    </Button>
                    <Typography>
                      Add new role, <br />
                      if it doesn&#39;t exist.
                    </Typography>
                  </div>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <CreateRoleDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditRoleDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedRoleId(null)
        }}
        onSuccess={() => {
          handleEditSuccess()
          setSelectedRoleId(null)
        }}
        roleId={selectedRoleId!}
      />
    </>
  )
}

export default RoleCards
