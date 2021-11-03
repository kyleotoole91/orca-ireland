import jwt_decode from "jwt-decode"

export class Permissions {
  check (token, action, resource) {
    let allow = false
    try {   
      if (token !== '') {
        let tokenDecoded = jwt_decode(token)
        allow = tokenDecoded.permissions !== undefined
        if (allow) {
          for (var permission of tokenDecoded.permissions) {
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
}
