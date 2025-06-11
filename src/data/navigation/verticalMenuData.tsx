// Type Imports
import type { VerticalMenuDataType, VerticalMenuItemDataType, VerticalSubMenuDataType, VerticalSectionDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'
import React from 'react'
import type { ReactNode } from 'react'
import type { ChipProps } from '@mui/material/Chip'
import axiosInstance from '@/utils/axios'

// 后端菜单数据类型
interface BackendMenuItem {
  menu_id: number
  menu_name: string
  parent_id: number
  order_num: number
  path?: string
  component?: string
  is_frame: string
  menu_type: 'M' | 'C' | 'F' | 'S'
  visible: string
  status: string
  perms?: string
  icon?: string
  target?: string
  exclude_lang?: boolean
  exact_match?: boolean
  active_url?: string
  is_section?: boolean
  prefix_text?: string
  prefix_icon?: string
  prefix_color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  suffix_text?: string
  suffix_icon?: string
  suffix_color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  children?: BackendMenuItem[]
}

// 从后端获取菜单数据
export const fetchMenuData = async () => {
  try {
    console.log('Fetching menu data...')
    const response = await axiosInstance.get('/account/menus/')
    console.log('Menu data response:', response.data)
    
    if (response.data.code === 200) {
      const menuList = response.data.data.list || []
      console.log('Parsed menu list:', menuList)
      return menuList as BackendMenuItem[]
    } else {
      console.error('Menu data fetch failed:', response.data.msg)
      return []
    }
  } catch (error: any) {
    console.error('Error fetching menu data:', error.response?.data || error)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return []
  }
}

// 转换后端菜单数据为前端格式
const transformMenuItem = (item: BackendMenuItem, dictionary: any): VerticalMenuDataType | null => {
  // 如果菜单被禁用或隐藏，返回 null
  if (item.status === '1' || item.visible === '1') {
    return null
  }

  // 处理图标
  const icon = item.icon && item.icon !== '#' ? item.icon : undefined

  // 处理前缀
  let prefix: ReactNode | ChipProps | undefined
  if (item.prefix_text || item.prefix_icon || item.prefix_color) {
    prefix = {
      label: item.prefix_text,
      icon: item.prefix_icon ? React.createElement('i', { className: item.prefix_icon }) : undefined,
      color: item.prefix_color
    }
  }

  // 处理后缀
  let suffix: ReactNode | ChipProps | undefined
  if (item.suffix_text || item.suffix_icon || item.suffix_color) {
    suffix = {
      label: item.suffix_text,
      icon: item.suffix_icon ? React.createElement('i', { className: item.suffix_icon }) : undefined,
      color: item.suffix_color
    }
  }

  // 创建基础菜单项
  const baseMenuItem = {
    id: String(item.menu_id), // 转换为字符串类型
    label: item.menu_name as ReactNode,
    href: item.path || undefined,
    target: item.target,
    excludeLang: item.exclude_lang,
    exactMatch: item.exact_match,
    activeUrl: item.active_url,
    icon,
    ...(prefix && { prefix }),
    ...(suffix && { suffix })
  }

  // 如果是分区
  if (item.menu_type === 'S' || item.is_section) {
    return {
      ...baseMenuItem,
      isSection: true,
      children: item.children?.map(child => transformMenuItem(child, dictionary)).filter(Boolean) || []
    } as VerticalSectionDataType
  }

  // 如果是目录或有子菜单
  if (item.menu_type === 'M' || (item.children && item.children.length > 0)) {
    return {
      ...baseMenuItem,
      children: item.children?.map(child => transformMenuItem(child, dictionary)).filter(Boolean) || []
    } as VerticalSubMenuDataType
  }

  // 普通菜单项
  return baseMenuItem as VerticalMenuItemDataType
}

const verticalMenuData = async (dictionary: Awaited<ReturnType<typeof getDictionary>>): Promise<VerticalMenuDataType[]> => {
  try {
    const menuData = await fetchMenuData()
    const transformedMenu = menuData.map(item => transformMenuItem(item, dictionary)).filter((item): item is VerticalMenuDataType => item !== null)
    console.log('Transformed menu data:', transformedMenu)
    return transformedMenu
  } catch (error) {
    console.error('Error processing menu data:', error)
    return []
  }
}

export default verticalMenuData
