import { Form, PrimaryButton } from '@zodiac/ui'

export const action = () => {
  throw new Error('Intentional action error')
}

const Component = () => {
  return (
    <Form>
      <PrimaryButton submit>Boom</PrimaryButton>
    </Form>
  )
}

export default Component
