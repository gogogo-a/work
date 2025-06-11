import axiosInstance from '@/utils/axios'

export interface TableInfo {
  table_name: string
  table_comment: string
}

export interface TablePermission {
  table_name: string
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
}

export interface RoleDetail {
  role_id: number
  role_name: string
  permissions: TablePermission[]
}

export interface CreateRoleRequest {
  role_name: string
  permissions: TablePermission[]
}

// 获取可操作的表列表
export const getTableList = async (): Promise<TableInfo[]> => {
  const response = await axiosInstance.get('/account/table-list/')
  return response.data.data
}

// 创建新角色及其权限
export const createRole = async (data: {
  role_name: string
  permissions: TablePermission[]
}): Promise<void> => {
  await axiosInstance.post('/account/role-stats/', data)
}

export const getRoleDetail = async (roleId: number): Promise<RoleDetail> => {
  if (!roleId) {
    throw new Error('Role ID is required')
  }

  try {
    const response = await axiosInstance.get(`/account/role-detail/${roleId}/`)
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error(response.data.msg || 'Failed to fetch role details')
  } catch (error: any) {
    console.error('Error fetching role details:', {
      error,
      roleId,
      message: error.message,
      response: error.response?.data
    })
    if (error.response?.data?.msg) {
      throw new Error(error.response.data.msg)
    }
    throw new Error(error.message || 'Failed to fetch role details')
  }
}

export const updateRole = async (data: {
  role_id: number
  role_name: string
  permissions: TablePermission[]
}): Promise<void> => {
  await axiosInstance.put('/account/role-stats/', data)
} 