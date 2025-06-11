import axios, { AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'

// 自定义错误类型
class CustomError extends Error {
  response?: AxiosResponse
  constructor(message: string) {
    super(message)
    this.name = 'CustomError'
  }
}

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  async config => {
    try {
      // 首先尝试从 localStorage 获取 token
      let token = localStorage.getItem('accessToken') || ''

      // 如果 localStorage 中没有 token，则从 session 获取
      if (!token) {
        const session = await getSession()
        // @ts-ignore - we know the token exists in the session
        token = session?.accessToken || ''
      }

      if (token) {
        // 确保 token 格式正确
        const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        config.headers['Authorization'] = finalToken
      }

      return config
    } catch (error) {
      console.error('Request interceptor error:', error)
      return Promise.reject(error)
    }
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    // 检查响应数据的格式
    if (response.data && response.data.code !== undefined) {
      if (response.data.code === 200) {
        return response
      } else {
        // 如果后端返回错误码，抛出错误
        const error = new CustomError(response.data.msg || '请求失败')
        error.response = response
        throw error
      }
    }
    return response
  },
  async error => {
    console.error('Response interceptor error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      console.log('401 error detected, clearing token and session')
      localStorage.removeItem('accessToken')
      
      // 如果不是登录页面，才重定向
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // 如果后端返回了错误信息，使用后端的错误信息
    if (error.response?.data?.msg) {
      const customError = new CustomError(error.response.data.msg)
      customError.response = error.response
      throw customError
    }
    
    throw error
  }
)

export default axiosInstance 