import { Page } from '@/components'
import { Success } from '@zodiac/ui'

const SignUpSuccess = () => {
  return (
    <Page>
      <Page.Header>Sign Up</Page.Header>
      <Page.Main>
        <Success title="Organization created">
          We've created a new organization for you and sent you further
          instructions via email.
        </Success>
      </Page.Main>
    </Page>
  )
}

export default SignUpSuccess
