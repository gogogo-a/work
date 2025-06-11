'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import UserViewLeft from './user-right/UserViewLeft'
import UserViewRight from './user-right/UserViewRight'

// Types & API Imports
import { UserData } from './types'
import { getUserDetail, getCurrentUser } from './api'

const UserView = () => {
  // States
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let data: UserData
        if (id) {
          // 如果提供了 id，获取指定用户的信息
          data = await getUserDetail(id)
        } else {
          // 如果没有提供 id，获取当前登录用户的信息
          data = await getCurrentUser()
        }
        
        setUserData(data)
      } catch (err: any) {
        console.error('获取用户数据失败:', err)
        setError(err.response?.data?.msg || '获取用户数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box className='flex items-center justify-center p-6'>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error' onClose={() => setError(null)} className='mb-4'>
            {error}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card>
        <CardContent>
          <Alert severity='info'>未找到用户数据</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <UserViewLeft data={userData} />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UserViewRight data={userData} />
      </Grid>
    </Grid>
  )
}

export default UserView 