// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import type { ChipProps } from '@mui/material/Chip'

// Type Imports
import type {
  SubMenuProps as VerticalSubMenuProps,
  MenuItemProps as VerticalMenuItemProps,
  MenuSectionProps as VerticalMenuSectionProps
} from '@menu/vertical-menu'
import type {
  SubMenuProps as HorizontalSubMenuProps,
  MenuItemProps as HorizontalMenuItemProps
} from '@menu/horizontal-menu'
import type { MenuItemExactMatchUrlProps } from '@menu/types'

// Vertical Menu Data
export type VerticalMenuItemDataType = Omit<
  VerticalMenuItemProps,
  'children' | 'exactMatch' | 'activeUrl' | 'icon' | 'prefix' | 'suffix'
> &
  MenuItemExactMatchUrlProps & {
    label: ReactNode
    excludeLang?: boolean
    icon?: string
    prefix?: ReactNode | ChipProps
    suffix?: ReactNode | ChipProps
  }
export type VerticalSubMenuDataType = Omit<VerticalSubMenuProps, 'children' | 'icon' | 'prefix' | 'suffix'> & {
  children: VerticalMenuDataType[]
  icon?: string
  prefix?: ReactNode | ChipProps
  suffix?: ReactNode | ChipProps
}
export type VerticalSectionDataType = Omit<VerticalMenuSectionProps, 'children' | 'icon' | 'prefix' | 'suffix'> & {
  children: VerticalMenuDataType[]
  icon?: string
  prefix?: ReactNode | ChipProps
  suffix?: ReactNode | ChipProps
}
export type VerticalMenuDataType = VerticalMenuItemDataType | VerticalSubMenuDataType | VerticalSectionDataType

// Horizontal Menu Data
export type HorizontalMenuItemDataType = Omit<
  HorizontalMenuItemProps,
  'children' | 'exactMatch' | 'activeUrl' | 'icon' | 'prefix' | 'suffix'
> &
  MenuItemExactMatchUrlProps & {
    label: ReactNode
    excludeLang?: boolean
    icon?: string
    prefix?: ReactNode | ChipProps
    suffix?: ReactNode | ChipProps
  }
export type HorizontalSubMenuDataType = Omit<HorizontalSubMenuProps, 'children' | 'icon' | 'prefix' | 'suffix'> & {
  children: HorizontalMenuDataType[]
  icon?: string
  prefix?: ReactNode | ChipProps
  suffix?: ReactNode | ChipProps
}
export type HorizontalMenuDataType = HorizontalMenuItemDataType | HorizontalSubMenuDataType

// 后端菜单数据类型
export interface BackendMenuItem {
  menu_id: number
  menu_name: string
  parent_id: number
  order_num: number
  path?: string
  component?: string | null
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
}
