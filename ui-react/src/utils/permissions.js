import jwt_decode from "jwt-decode"

export class Permissions {
  check (token, action, resource) {
    try {   
      if (token !== '') {
        let tokenDecoded = jwt_decode(token)
        if (tokenDecoded.permissions !== undefined) {
          for (var permission of tokenDecoded.permissions) {
            if (permission === 'super:super' || permission === action+':'+resource) { 
              return true 
            }
          }
        }
        return false
      }
    } catch (error) {
        console.error(error)
        return false
    }    
  }
}
