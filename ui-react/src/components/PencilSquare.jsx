import React from 'react'
import { BsPencilSquare } from "react-icons/bs" //https://react-icons.github.io/react-icons/icons?name=bs
import styled from 'styled-components'

export const PencilSquare = ({id, handleClick = () => {}}) => {
  return (
    <Icon onClick={() => handleClick(id)} />
  )
}

const Icon = styled(BsPencilSquare)`
  float: right;
  color: ${({ theme}) => theme.primaryLight};
  &:hover {
    color: ${({ theme}) => theme.hoverMenuItem};
  }
`
