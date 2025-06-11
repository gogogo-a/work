import axios from '@/utils/axios'

export interface RoleCardData {
  id: number
  title: string
  totalUsers: number
  avatars: string[]
}

interface RawRoleData {
  role_id?: number | string
  id?: number | string
  role_name?: string
  title?: string
  total_users?: number
  totalUsers?: number
  avatars?: string[]
}

// 获取角色列表
export const getRoles = async (): Promise<{ role_id: number; role_name: string }[]> => {
  try {
    const response = await axios.get('/account/roles/')
    if (response.data.code === 200) {
      return response.data.data.list || []  // 注意这里的 .list
    }
    throw new Error(response.data.msg || 'Failed to fetch roles')
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw error
  }
}

export const getRoleStats = async (): Promise<RoleCardData[]> => {
  try {
    // 并行获取角色统计和角色列表
    const [statsResponse, rolesResponse] = await Promise.all([
      axios.get('/account/role-stats/'),
      getRoles()
    ])
    
    console.log('Role stats response:', statsResponse.data)
    console.log('Roles response:', rolesResponse)
    
    if (statsResponse.data.code === 200 && Array.isArray(statsResponse.data.data)) {
      // 创建一个角色名称到ID的映射
      const roleMap = new Map(rolesResponse.map(role => [role.role_name, role.role_id]))
      
      return statsResponse.data.data
        .map((item: RawRoleData): RoleCardData | null => {
          const title = item.role_name || item.title || ''
          const roleId = roleMap.get(title)
          
          if (roleId === undefined) {
            console.warn('Missing role_id for role:', title)
            return null
          }
                        
          const result: RoleCardData = {
            id: roleId,
            title,
            totalUsers: typeof item.total_users === 'number' ? item.total_users :
                       typeof item.totalUsers === 'number' ? item.totalUsers : 0,
            avatars: Array.isArray(item.avatars) ? item.avatars : []
          }

          console.log('Processed role item:', result)
          return result
        })
        .filter((item: RoleCardData | null): item is RoleCardData => item !== null)
    }
    
    console.error('Invalid response format:', statsResponse.data)
    throw new Error(statsResponse.data.msg || 'Invalid response format')
  } catch (error) {
    console.error('Error fetching role stats:', error)
    throw error
  }
} 