import jwt_decode from "jwt-decode"

export class Permissions {
  
  check (token, action, resource) {
    let allow = false
    try {   
      if (token !== '') {
        let tokenDecoded = jwt_decode(token)
        if (tokenDecoded.permissions !== undefined) {
          for (var permission of tokenDecoded.permissions) {
            if (action ==='super' && resource === 'super') {
              return true
            }
            allow = permission === action+':'+resource
            if (allow) { break }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }    
    return allow
  }

  userInToken (encodedToken, extId) {
    let tokenDecoded = jwt_decode(encodedToken)
    return tokenDecoded.sub === extId
  }

  extIdFromToken(encodedToken){
    let tokenDecoded = jwt_decode(encodedToken)
    return tokenDecoded.sub
  }
}
