import { useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"  

export const useApiToken = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [ apiToken, setApiToken ] = useState('')

  useEffect(() => {
    async function retrieveToken () {
      if (apiToken === '') {
        const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
        setApiToken(token);
      }
    }
    retrieveToken();
  }, []);

  return apiToken;
} 