import React from 'react'
import { BsFillTrashFill } from "react-icons/bs" //https://react-icons.github.io/react-icons/icons?name=bs
import styled from 'styled-components'

export const TrashCan = ({id, handleClick = () => {}}) => {
  return (
    <GearBtn onClick={() => handleClick(id)} />
  )
}

const GearBtn = styled(BsFillTrashFill)`
  margin-top: 6px;
  margin-left: 6px;
  color: ${({ theme}) => theme.deleteColor};
  &:hover {
    color: ${({ theme}) => theme.deleteHover};
  }
`
