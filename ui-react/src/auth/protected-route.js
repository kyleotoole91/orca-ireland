import React from "react";
import { Route } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
//import { Loading } from "../components/index";
//onRedirecting: () => <Loading />,

const ProtectedRoute = ({ component, ...args }) => (
  <Route
    component={withAuthenticationRequired(component, {
      
    })}
    {...args}
  />
);

export default ProtectedRoute