import React from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";

const Garage = () => {  
  return (
    <div>
      <h1>Garage</h1>
    </div>
  )
}

export default withAuthenticationRequired(Garage, {
  onRedirecting: () => (<div>Redirecting you..</div>)  
});

