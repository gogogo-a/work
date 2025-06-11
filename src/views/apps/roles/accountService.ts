import axios from '@/utils/axios'

export interface AccountType {
  account_id: number
  account_name: string
  account_email: string
  phone_number: string | null
  sex: string
  avatar: string | null
  status: string
  remark: string | null
  role_name: string | null
  role_id: number | null
}

export interface RoleType {
  role_id: number
  role_name: string
  status: string
  remark: string | null
}

export interface PaginatedResponse {
  list: AccountType[]
  total: number
  page: number
  size: number
  pages: number
}

export interface CreateAccountData {
  account_name: string
  account_email: string
  phone_number: string
  sex: string
  status: string
  remark: string
  roles: number[]
}

export interface CreateAccountResponse {
  account: AccountType
  initial_password: string
}

export const fetchAccounts = async (params: {
  page: number
  size: number
  keyword?: string
  role_id?: number
}): Promise<PaginatedResponse> => {
  try {
    const response = await axios.get('/account/accounts/', { params })
    return response.data.data
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw error
  }
}

export const fetchRoles = async (): Promise<RoleType[]> => {
  try {
    const response = await axios.get('/account/roles/')
    return response.data.data.list
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw error
  }
}

export const createAccount = async (data: CreateAccountData): Promise<CreateAccountResponse> => {
  try {
    const response = await axios.post('/account/create/', data)
    return response.data.data
  } catch (error) {
    console.error('Error creating account:', error)
    throw error
  }
} 