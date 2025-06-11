// 用户数据类型
export interface UserData {
  account_id: number
  account_name: string
  account_email: string
  phone_number: string | null
  sex: '0' | '1' | '2'
  status: '0' | '1'
  avatar: string | null
  remark: string | null
  roles: Array<{
    role_id: number
    role_name: string
    role_status: '0' | '1'
  }>
}

// 更新用户数据的类型
export interface UpdateUserData {
  account_name: string
  account_email: string
  phone_number: string
  sex: '0' | '1' | '2'
  status: '0' | '1'
  remark: string
  roles: number[]
}

// 角色类型
export interface RoleType {
  role_id: number
  role_name: string
  status: '0' | '1'
} 