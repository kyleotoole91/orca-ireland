import React from 'react'

export const Header = ({props}) => {
  return (
    <div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
      <h4 style={{fontWeight: 'bold'}}>{props.header}</h4>
      <h5>{props.subHeader}</h5>
      <h5>{props.subHeader2}</h5>
      <h5>{props.subHeader3}</h5>
    </div>
  )
}

export default Header

