import React from 'react'
import { BsFillTrashFill } from "react-icons/bs" //https://react-icons.github.io/react-icons/icons?name=bs
import styled from 'styled-components'

export const TrashCan = ({id, handleClick = () => {}}) => {
  return (
    <Icon onClick={() => handleClick(id)} />
  )
}

const Icon = styled(BsFillTrashFill)`
  color: ${({ theme}) => theme.deleteColor};
  &:hover {
    color: ${({ theme}) => theme.deleteHover};
  }
`
