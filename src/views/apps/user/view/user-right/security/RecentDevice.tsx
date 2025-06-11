'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import Collapse from '@mui/material/Collapse'

// Third-party Imports
import axios from '@/utils/axios'
import dayjs from 'dayjs'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

// Styled Components
const ExpandButton = styled(IconButton)({
  transform: 'rotate(0deg)',
  marginLeft: 'auto',
  transition: 'transform 0.3s'
})

const ExpandedButton = styled(ExpandButton)({
  transform: 'rotate(180deg)'
})

interface RecentDeviceProps {
  userId?: string
}

const RecentDevice = ({ userId }: RecentDeviceProps) => {
  // States
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    fetchLogs()
  }, [pagination.page, pagination.size, keyword, userId])

  // Handlers
  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 创建请求参数对象
      const params = {
        page: pagination.page,
        size: pagination.size,
        keyword: keyword || '',
        userId: userId // 添加 userId 参数
      }
      
      // 调试日志
      console.log('Request params:', params)

      const response = await axios.get<{ code: number; msg: string; data: PaginatedResponse }>(
        '/account/logs/',
        {
          params,
          // 确保参数不会被过滤掉
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

  const getBusinessType = (type: string) => {
    const types: { [key: string]: string } = {
      '0': '其他',
      '1': '新增',
      '2': '修改',
      '3': '删除',
      '4': '授权',
      '5': '导出',
      '6': '导入',
      '7': '强退',
      '8': '生成代码',
      '9': '清空数据'
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
        title='操作日志' 
        action={
          <Box className='flex items-center gap-4'>
            <CustomTextField
              select
              value={pagination.size}
              onChange={handleSizeChange}
              className='w-[100px]'
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </CustomTextField>
            <CustomTextField
              placeholder='搜索日志...'
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
                      {log.oper_account} - {dayjs(log.oper_time).format('YYYY-MM-DD HH:mm:ss')}
                    </Typography>
                  </Box>
                  <Box className='flex items-center gap-2'>
                    <Typography
                      variant='caption'
                      className={`px-2 py-1 rounded-full ${
                        log.status === '1' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-error-100 text-error-700'
                      }`}
                    >
                      {log.status === '1' ? '成功' : '失败'}
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
                      <strong>业务类型:</strong> {getBusinessType(log.business_type)}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>请求方法:</strong> {log.request_method} {log.method}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>IP地址:</strong> {log.oper_ip}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>操作地点:</strong> {log.oper_location}
                    </Typography>
                    {log.oper_param && (
                      <Typography variant='body2' component='div'>
                        <strong>请求参数:</strong>
                        <pre className='mt-1 p-2 bg-gray-50 rounded overflow-x-auto'>
                          {log.oper_param}
                        </pre>
                      </Typography>
                    )}
                    {log.json_result && (
                      <Typography variant='body2' component='div'>
                        <strong>返回结果:</strong>
                        <pre className='mt-1 p-2 bg-gray-50 rounded overflow-x-auto'>
                          {log.json_result}
                        </pre>
                      </Typography>
                    )}
                    {log.error_msg && (
                      <Typography variant='body2' color='error'>
                        <strong>错误信息:</strong> {log.error_msg}
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
              显示 {(pagination.page - 1) * pagination.size + 1} 到{' '}
              {Math.min(pagination.page * pagination.size, pagination.total)} 条，共 {pagination.total} 条记录
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
            暂无日志记录
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentDevice
