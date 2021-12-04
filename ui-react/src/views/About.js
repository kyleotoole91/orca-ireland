import { React } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import Accordion  from 'react-bootstrap/Accordion'
import styled from 'styled-components'

function Rules() {
  function addAccordianItem(header, eventKey, pdfUrl) {
    return  (
      <Accordion.Item eventKey={eventKey}>
        <StyledAccordionHeader>{header}</StyledAccordionHeader>
        <Accordion.Body >
          <a href={pdfUrl}>
            <img alt="Qries" src='/images/printer.png' style={{width:'24px', height:'24px'}}/>
          </a>
          <Viewer fileUrl={pdfUrl} />
        </Accordion.Body>
      </Accordion.Item>
    )
  }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey='0'>
        <StyledAccordionHeader>About Us</StyledAccordionHeader>
          <Accordion.Body>
          <div style={{maxWidth: '400px'}}> 
          ORCA was founded in 1997, but some of our members have been involved in model car racing since the late 80's. 
          Back then the club was racing in what was then the main car park in University College Dublin. Racing is now at St. Annes Park, Raheny
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
