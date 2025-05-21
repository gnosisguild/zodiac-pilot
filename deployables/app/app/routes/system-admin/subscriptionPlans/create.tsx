import { Form, GhostButton, Modal, PrimaryButton, TextInput } from '@zodiac/ui'
import { href, useNavigate } from 'react-router'

const CreateSubscriptionPlan = () => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Add new plan"
      onClose={() => navigate(href('/system-admin/subscriptionPlans'))}
    >
      <Form>
        <TextInput required label="Name" name="name" />

        <Modal.Actions>
          <PrimaryButton submit>Add</PrimaryButton>
          <GhostButton
            onClick={() => navigate(href('/system-admin/subscriptionPlans'))}
          >
            Cancel
          </GhostButton>
        </Modal.Actions>
      </Form>
    </Modal>
  )
}

export default CreateSubscriptionPlan
