'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Collapse from '@mui/material/Collapse'
import Alert from '@mui/material/Alert'

// Third-party Imports
import axios from '@/utils/axios'
import dayjs from 'dayjs'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomPagination from '@/views/apps/roles/CustomPagination'

interface OperationLog {
  oper_id: number
  title: string
  business_type: string
  method: string
  request_method: string
  operator_type: string
  oper_account: string
  oper_ip: string
  oper_location: string
  oper_param: string
  json_result: string
  status: string
  error_msg: string | null
  oper_time: string
}

interface PaginatedResponse {
  list: OperationLog[]
  total: number
  page: number
  size: number
  pages: number
}

interface UserInfo {
  account_id: number
  account_name: string
  account_email: string
}

// Styled Components
const ExpandButton = styled(IconButton)({
  transform: 'rotate(0deg)',
  marginLeft: 'auto',
  transition: 'transform 0.3s'
})

const ExpandedButton = styled(ExpandButton)({
  transform: 'rotate(180deg)'
})

const RecentDevicesTable = () => {
  // States
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    pages: 0
  })
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({})
  const [keyword, setKeyword] = useState('')

  // Effects
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchLogs()
    }
  }, [pagination.page, pagination.size, keyword, currentUser])

  // Handlers
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/account/info/')
      if (response.data.code === 200) {
        setCurrentUser(response.data.data)
      } else {
        throw new Error(response.data.msg)
      }
    } catch (err: any) {
      console.error('获取当前用户信息失败:', err)
      setError(err.message || '获取当前用户信息失败')
    }
  }

  const fetchLogs = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        size: pagination.size,
        keyword: keyword || '',
        userId: currentUser.account_id
      }
      
      console.log('Request params:', params)

      const response = await axios.get<{ code: number; msg: string; data: PaginatedResponse }>(
        '/account/logs/',
        {
          params,
          paramsSerializer: {
            serialize: (params) => {
              return Object.entries(params)
                .map(([key, value]) => `${key}=${value !== undefined ? value : ''}`)
                .join('&')
            }
          }
        }
      )
      
      if (response.data.code === 200) {
        setLogs(response.data.data.list)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total,
          pages: response.data.data.pages
        }))
      } else {
        throw new Error(response.data.msg)
      }
    } catch (err: any) {
      console.error('Fetch logs error:', err)
      setError(err.message || '获取日志失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      size: Number(event.target.value),
      page: 1
    }))
  }

  const toggleExpand = (operId: number) => {
    setExpanded(prev => ({
      ...prev,
      [operId]: !prev[operId]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '0':
        return 'error'
      case '1':
        return 'success'
      default:
        return 'warning'
    }
  }

  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
  }

  const getBusinessType = (type: string) => {
    const types: { [key: string]: string } = {
      '0': 'Other',
      '1': 'Create',
      '2': 'Update',
      '3': 'Delete',
      '4': 'Auth',
      '5': 'Export',
      '6': 'Import',
      '7': 'Force Logout',
      '8': 'Gen Code',
      '9': 'Clear'
    }
    return types[type] || type
  }

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title='Operation Logs' 
        action={
          <Box className='flex items-center gap-4'>
            <CustomTextField
              placeholder='Search logs...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-[200px]'
            />
          </Box>
        }
      />
      <CardContent>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        <div className='space-y-4'>
          {logs.map(log => (
            <Card key={log.oper_id} variant='outlined'>
              <CardContent>
                <Box className='flex items-center justify-between'>
                  <Box>
                    <Typography variant='subtitle1' className='font-medium'>
                      {log.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {log.oper_account} - {formatDateTime(log.oper_time)}
                    </Typography>
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <Typography
                      variant='caption'
                      className={`px-2 py-1 rounded-full bg-${getStatusColor(log.status)}-100 text-${getStatusColor(
                        log.status
                      )}-700`}
                    >
                      {log.status === '1' ? 'Success' : 'Failed'}
                    </Typography>
                    {expanded[log.oper_id] ? (
                      <ExpandedButton onClick={() => toggleExpand(log.oper_id)}>
                        <i className='tabler-chevron-down' />
                      </ExpandedButton>
                    ) : (
                      <ExpandButton onClick={() => toggleExpand(log.oper_id)}>
                        <i className='tabler-chevron-down' />
                      </ExpandButton>
                    )}
                  </Box>
                </Box>
                <Collapse in={expanded[log.oper_id]}>
                  <Box className='mt-4 space-y-2'>
                    <Typography variant='body2'>
                      <strong>Business Type:</strong> {getBusinessType(log.business_type)}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Method:</strong> {log.request_method} {log.method}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>IP:</strong> {log.oper_ip}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Location:</strong> {log.oper_location}
                    </Typography>
                    {log.oper_param && (
                      <Typography variant='body2' component='div'>
                        <strong>Parameters:</strong>
                        <pre className='mt-1 p-2 bg-gray-50 rounded overflow-x-auto'>
                          {log.oper_param}
                        </pre>
                      </Typography>
                    )}
                    {log.json_result && (
                      <Typography variant='body2' component='div'>
                        <strong>Response:</strong>
                        <pre className='mt-1 p-2 bg-gray-50 rounded overflow-x-auto'>
                          {log.json_result}
                        </pre>
                      </Typography>
                    )}
                    {log.error_msg && (
                      <Typography variant='body2' color='error'>
                        <strong>Error:</strong> {log.error_msg}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </div>
        {logs.length > 0 && (
          <Box className='flex justify-between items-center mt-4'>
            <Typography>
              Showing {(pagination.page - 1) * pagination.size + 1} to{' '}
              {Math.min(pagination.page * pagination.size, pagination.total)} of {pagination.total} entries
            </Typography>
            <CustomPagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </Box>
        )}
        {logs.length === 0 && !loading && (
          <Typography align='center' color='text.secondary'>
            No logs found
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentDevicesTable
