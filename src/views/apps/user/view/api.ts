import axios from '@/utils/axios'
import { UserData, UpdateUserData, RoleType } from './types'

// Get user detail
export const getUserDetail = async (id: string | number): Promise<UserData> => {
  try {
    const response = await axios.get(`/account/detail/${id}/`)
    console.log('User detail response:', response.data)
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching user detail:', error)
    throw error
  }
}

// Get current user info
export const getCurrentUser = async (): Promise<UserData> => {
  try {
    const response = await axios.get('/account/info/')
    console.log('Current user response:', response.data)
    return response.data.data
  } catch (error: any) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

// Update user information
export const updateUser = async (id: string | number, data: UpdateUserData): Promise<void> => {
  try {
    console.log('Updating user with data:', data)
    const response = await axios.put(`/account/detail/${id}/`, data)
    console.log('Update user response:', response.data)
  } catch (error: any) {
    console.error('Error updating user:', error.response?.data || error)
    throw error
  }
}

// Get role list
export const getRoles = async (): Promise<RoleType[]> => {
  try {
    console.log('Fetching roles...')
    const response = await axios.get('/account/roles/')
    console.log('Roles response:', response.data)
    const roles = Array.isArray(response.data.data.list) ? response.data.data.list : []
    console.log('Parsed roles:', roles)
    return roles
  } catch (error: any) {
    console.error('Error fetching roles:', error.response?.data || error)
    return []
  }
} 