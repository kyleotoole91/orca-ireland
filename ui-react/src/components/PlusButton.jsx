import React from 'react'
import { BsFillPlusCircleFill } from "react-icons/bs"
import styled from 'styled-components'

export const PlusButton = ({id, handleClick = () => {}}) => {
  return (
    <div style={{height: '15px', maxWidth: '15px'}} >
      <PlusBtn onClick={() => handleClick(id)}></PlusBtn> 
    </div>
  )
}

const PlusBtn = styled(BsFillPlusCircleFill)`
  margin-top: 6px;
  margin-left: 6px;
  color: ${({ theme}) => theme.primaryLight};
  &:hover {
    color: ${({ theme}) => theme.hoverMenuItem};
  }
`
