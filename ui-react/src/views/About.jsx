import { React } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import Accordion  from 'react-bootstrap/Accordion'
import styled from 'styled-components'
import Header from '../components/Header'

function Rules() {
  function addAccordianItem(header, eventKey, pdfUrl) {
    return  (
      <Accordion.Item eventKey={eventKey}>
        <StyledAccordionHeader>{header}</StyledAccordionHeader>
        <Accordion.Body style={{maxWidth: '1000px', textAlign: 'left'}}>
          <a href={pdfUrl}>
            <img alt="Qries" src='/images/download.png' style={{width:'28px', height:'28px'}}/>
          </a>
          <Viewer fileUrl={pdfUrl} />
        </Accordion.Body>
      </Accordion.Item>
    )
  }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
      <Header props={{header:'About'}} /> 
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey='0'>
        <StyledAccordionHeader>About Us</StyledAccordionHeader>
          <Accordion.Body>
          <div style={{maxWidth: '400px'}}> 
            <p>
              ORCA was founded in 1997, but some of our members have been involved in model car racing since the late 80's. 
              Back then the club was racing in what was then the main car park in University College Dublin. Racing is now at St. Annes Park, Raheny.
            </p>
            <p>
              We, the club members primarily race 1/8 scale nitro machines with the GT class becoming very popular due to their
              predictable handling in all weather conditions. We also have a faster GP class, also known as 1/8 On Road. 
              These cars use foam tyres that offer incredible traction, especially on dry surfaces.
            </p>
          </div>   
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='1'>

        <StyledAccordionHeader>Rules</StyledAccordionHeader>
        <Accordion.Body>
          <Accordion>
            {addAccordianItem('Club Constitution', '2', '/rules/ClubConstitution.pdf')}
            {addAccordianItem('General Rules',     '3', '/rules/GeneralRules.pdf')}
            {addAccordianItem('GP Rules',          '4', '/rules/GPRules.pdf')}
            {addAccordianItem('GT Pro',            '5', '/rules/GTProRules.pdf')}
            {addAccordianItem('GT Clubman Rules',  '6', '/rules/GTClubmanRules.pdf')}
          </Accordion>  
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>   
    </Worker>
  )

}

const StyledAccordionHeader = styled(Accordion.Header)`
  .accordion-button:focus {
    z-index: 0
  }
`

export default Rules