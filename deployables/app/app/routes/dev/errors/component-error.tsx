import { useEffect } from 'react'

const ErrorComponent = () => {
  useEffect(() => {
    throw new Error('Intentional component error')
  })

  return <div>Boom</div>
}

export default ErrorComponent
