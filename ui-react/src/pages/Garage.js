import React from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from '../components/Loading';

function Garage () {  
  return (
    <div>
      <h1>Garage</h1>
    </div>
  )
}

export default withAuthenticationRequired(Garage, {
  onRedirecting: () => (<Loading />)  
});

