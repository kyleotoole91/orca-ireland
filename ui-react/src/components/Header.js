import React from 'react'

function Header({props}){
  return (
    <div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
      <h4>{props.header}</h4>
      <h4>{props.subHeader}</h4>
    </div>
  )
}

export default Header

