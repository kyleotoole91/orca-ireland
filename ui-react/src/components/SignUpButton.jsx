import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const SignUpButton = () => {
  const { loginWithRedirect } = useAuth0()
  return (
    <button className="btn btn-primary btn-block btn-sm" onClick={() => loginWithRedirect({screen_hint: 'signup',})}>
      Sign up
    </button>
  )
}

export default SignUpButton
