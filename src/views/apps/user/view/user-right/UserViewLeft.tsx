'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Types Import
import { UserData } from '../types'

interface Props {
  data: UserData
}

const UserViewLeft = ({ data }: Props) => {
  const getSexText = (sex: '0' | '1' | '2') => {
    const sexMap = {
      '0': '男',
      '1': '女',
      '2': '未知'
    }
    return sexMap[sex]
  }

  const getStatusColor = (status: '0' | '1') => {
    return status === '0' ? 'success' : 'error'
  }

  const getStatusText = (status: '0' | '1') => {
    return status === '0' ? '启用' : '禁用'
  }

  return (
    <Card>
      <CardContent className='flex flex-col items-center'>
        <CustomAvatar
          src={data.avatar || '/images/avatars/1.png'}
          variant='rounded'
          alt={data.account_name}
          className='mbe-4'
          size={120}
        />
        <Typography variant='h5' className='mbe-2'>
          {data.account_name}
        </Typography>
        <Chip
          label={getStatusText(data.status)}
          color={getStatusColor(data.status)}
          size='small'
        />
      </CardContent>

      <CardContent>
        <Typography variant='h6' className='mbe-4'>
          基本信息
        </Typography>
        <div className='flex flex-col gap-4'>
          <Box className='flex justify-between'>
            <Typography className='font-medium' color='text.primary'>
              邮箱:
            </Typography>
            <Typography>{data.account_email}</Typography>
          </Box>
          <Box className='flex justify-between'>
            <Typography className='font-medium' color='text.primary'>
              手机号:
            </Typography>
            <Typography>{data.phone_number || '未设置'}</Typography>
          </Box>
          <Box className='flex justify-between'>
            <Typography className='font-medium' color='text.primary'>
              性别:
            </Typography>
            <Typography>{getSexText(data.sex)}</Typography>
          </Box>
        </div>

        <Divider className='mbs-6 mbe-6' />

        <Typography variant='h6' className='mbe-4'>
          角色信息
        </Typography>
        <Box className='flex flex-wrap gap-2'>
          {data.roles.map(role => (
            <Chip
              key={`role-${role.role_id}`}
              label={role.role_name}
              color={role.role_status === '0' ? 'primary' : 'default'}
              size='small'
            />
          ))}
        </Box>

        {data.remark && (
          <>
            <Divider className='mbs-6 mbe-6' />
            <Typography variant='h6' className='mbe-4'>
              备注
            </Typography>
            <Typography>{data.remark}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default UserViewLeft 