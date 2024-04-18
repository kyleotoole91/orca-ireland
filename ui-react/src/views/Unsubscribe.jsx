import { React, useState, useEffect } from 'react'
import Loading from '../components/Loading'
import { UnsubscribeModel } from '../models/UnsubscribeModel'

function UnsubscribeView() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function unsubscribe () {
      setLoading(true)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const urlSubscribe = urlParams.get('subscribe');
        const subscribe = urlSubscribe === 'true' || urlSubscribe === '1' ? true : false;

        if (!email) {
          setMessage('No email specified. Please contact the site administrator.')
          return
        }

        const api = new UnsubscribeModel();
        await api.post({ email, subscribe });

        if (!api.success) {
          setMessage('An error occurred while processing the request. Please contact the site administrator.')
          return
        }
        setMessage(api.message)
      }  catch (err) {
        console.error(err.message)
        setMessage('An error occurred while processing the request. Please contact the site administrator.')
      } finally {
        setLoading(false)
      }
    }  
    unsubscribe()
  }, [])

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <h4 style={{textAlign: 'center'}}>{message}</h4> 
    )
  }
}

export default UnsubscribeView
