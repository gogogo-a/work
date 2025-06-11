// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ChangePassword from './ChangePassword'
import TwoStepVerification from './TwoStepVerification'
import RecentDevice from './RecentDevice'

interface SecurityTabProps {
  userId?: string
}

const SecurityTab = ({ userId }: SecurityTabProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ChangePassword />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TwoStepVerification />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RecentDevice userId={userId} />
      </Grid>
    </Grid>
  )
}

export default SecurityTab
