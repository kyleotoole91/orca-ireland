import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const MenuItems = () => {
  return (
    <>
      <MenuItem><Link to='./'>Home</Link></MenuItem>
      <MenuItem><Link to='/events'>Events</Link></MenuItem>
      <MenuItem><Link to='/garage'>Garage</Link></MenuItem>
      <MenuItem><Link to='./membership'>Membership</Link></MenuItem>
    </ >
  )
};

const MenuItem = styled.div`
  display: flex;
  align-items: center; 
  float: left;
  position: 'relative';
  height: 100%;
  text-align: centre;
  padding-left: 12px;
  padding-right: 12px;
  transition: all 0.3s ease-in;
  font-size: 18px;
  font-family: ${({ theme}) => theme.menuFont};
  color: ${({ theme}) => theme.primaryLight};
  &:hover {
    background: white;
  }
  @media (max-width: ${({ theme}) => theme.mobile}) {
    display: none;
  }
`;

export default MenuItems