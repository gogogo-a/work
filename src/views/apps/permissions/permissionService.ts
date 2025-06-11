import axios from '@/utils/axios'

// 类型定义
export interface TablePermission {
  permission_id: number
  name: string
  table_desc: string
  assignedTo: string[]
  createdDate: string
  permissions: {
    can_read: boolean
    can_create: boolean
    can_update: boolean
    can_delete: boolean
  }
}

export interface TablePermissionResponse {
  code: number
  msg: string
  data: {
    list: TablePermission[]
    total: number
    current_page: number
    total_pages: number
    page_size: number
  }
}

export interface UpdatePermissionRequest {
  table_name: string
  table_desc: string
  role_names: string[]
  permissions: {
    can_read: boolean
    can_create: boolean
    can_update: boolean
    can_delete: boolean
  }
}

interface UpdateTableDescRequest {
  table_name: string
  table_desc: string
}

interface UnconfiguredTable {
  table_name: string
  table_comment: string
}

interface UnconfiguredTablesResponse {
  code: number
  msg: string
  data: UnconfiguredTable[]
}

const API_URL = '/account'

export const permissionService = {
  // 获取表权限列表
  getTablePermissions: async (page: number, size: number, search?: string) => {
    try {
      const response = await axios.get<TablePermissionResponse>(`${API_URL}/table-permissions/`, {
        params: {
          page,
          size,
          search
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching table permissions:', error)
      throw error
    }
  },

  // 更新表权限
  updateTablePermission: async (data: UpdatePermissionRequest) => {
    try {
      const response = await axios.post(`${API_URL}/table-permissions/`, data)
      return response.data
    } catch (error) {
      console.error('Error updating table permission:', error)
      throw error
    }
  },

  // 更新表描述
  updateTableDesc: async (data: UpdateTableDescRequest) => {
    try {
      const response = await axios.put(`${API_URL}/table-permissions/`, data)
      return response.data
    } catch (error) {
      console.error('Error updating table description:', error)
      throw error
    }
  },

  // 删除表及其权限
  deleteTable: async (tableName: string) => {
    try {
      const response = await axios.delete(`${API_URL}/table-permissions/`, {
        params: {
          table_name: tableName
        }
      })
      return response.data
    } catch (error) {
      console.error('Error deleting table:', error)
      throw error
    }
  },

  // 获取未配置的表
  getUnconfiguredTables: async () => {
    try {
      const response = await axios.get<UnconfiguredTablesResponse>(`${API_URL}/unconfigured-tables/`)
      return response.data
    } catch (error) {
      console.error('Error fetching unconfigured tables:', error)
      throw error
    }
  }
} 