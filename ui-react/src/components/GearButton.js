import React from 'react'
import { BsFillGearFill } from "react-icons/bs"
import styled from 'styled-components'

export const GearButton = ({id, handleClick = () => {}}) => {
  return (
    <GearBtn onClick={() => handleClick(id)} />
  )
}

const GearBtn = styled(BsFillGearFill)`
  margin-top: 6px;
  margin-left: 6px;
  color: ${({ theme}) => theme.primaryLight};
  &:hover {
    color: ${({ theme}) => theme.hoverMenuItem};
  }
`
