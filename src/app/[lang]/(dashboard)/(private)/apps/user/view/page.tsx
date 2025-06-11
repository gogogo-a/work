'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import UserView from '@views/apps/user/view/UserView'
import CustomTabList from '@core/components/mui/TabList'

const SecurityTab = dynamic(() => import('@views/apps/user/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/user/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/user/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/user/view/user-right/connections'))

const UserViewPage = () => {
  // States
  const [activeTab, setActiveTab] = useState('overview')

  // Hooks
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <TabContext value={activeTab}>
    <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-users' />} value='overview' label='Overview' iconPosition='start' />
            <Tab icon={<i className='tabler-lock' />} value='security' label='Security' iconPosition='start' />
            <Tab
              icon={<i className='tabler-bookmark' />}
              value='billing'
              label='Billing & Plans'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-bell' />}
              value='notifications'
              label='Notifications'
              iconPosition='start'
            />
            <Tab icon={<i className='tabler-link' />} value='connections' label='Connections' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value='overview' className='p-0'>
            <UserView />
          </TabPanel>
          <TabPanel value='security' className='p-0'>
            <SecurityTab userId={id} />
          </TabPanel>
          <TabPanel value='billing' className='p-0'>
            <BillingPlans />
          </TabPanel>
          <TabPanel value='notifications' className='p-0'>
            <NotificationsTab />
          </TabPanel>
          <TabPanel value='connections' className='p-0'>
            <ConnectionsTab />
          </TabPanel>
      </Grid>
      </Grid>
    </TabContext>
  )
}

export default UserViewPage
