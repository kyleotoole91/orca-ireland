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
      


      <Accordion>
        {addAccordianItem('Club Constitution', '0', '/rules/ClubConstitution.pdf')}
        {addAccordianItem('General Rules',     '1', '/rules/GeneralRules.pdf')}
        {addAccordianItem('GP Rules',          '2', '/rules/GPRules.pdf')}
        {addAccordianItem('GT Pro',            '3', '/rules/GTProRules.pdf')}
        {addAccordianItem('GT Clubman Rules',  '4', '/rules/GTClubmanRules.pdf')}
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
