import React from 'react'
import InfinityLogo from './images/infinity-logo.png'
import HNLogo from './images/HN-logo.png'
import ShootLogo from './images/shootfuel-logo.png'
import GeniusLogo from './images/genius-logo.png'
import styled from 'styled-components'

export const BrandsBand = () => {
  return (
    <div style={{maxWidth: '2048px', display: 'flex-flow'}}>
      <a href='http://www.creationmodel.net/infinity/'>
        <Banding alt='infinity logo' src={InfinityLogo} />
      </a>
      <a href='https://www.modeltekshop.com/en/'>
        <Banding alt='genius logo' src={GeniusLogo} />
      </a>
      <a href='http://www.hongnor-racing.com/'>
        <Banding alt='hong nor logo' src={HNLogo} />
      </a>
      <a href='https://xtr-rc.com/en/brand/11-shoot-fuel'>
        <Banding style={{maxHeight: '18px'}} alt='shoot fuel' src={ShootLogo} />
      </a>
    </div>
  )
}

const Banding = styled.img`
  max-width: 75px;
  margin: 6px;
`;
