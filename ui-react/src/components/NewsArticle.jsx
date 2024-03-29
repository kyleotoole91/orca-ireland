import React from 'react'
import Card from 'react-bootstrap/Card'
import { DateUtils } from '../utils/DateUtils'
import { GearButton} from '../components/GearButton'

const cLinkMask='link:'

export const NewsArticle = ({props}) => {
  const dateUtils = new DateUtils()
  const article = props.article
  const gearButtonClick = props.editArticle
  const showGearBtn = props.allowAddArticles

  return (
    <Card key={'card' + article._id} style={{ width: 'auto', maxWidth: '40rem', marginBottom: '18px' }}>
      <Card.Header className="text-muted">{article.headline}</Card.Header>
      <Card.Img variant="top" src={article.image} />
      <Card.Body>
        <Card.Title>{article.headline}</Card.Title>
        {getCardParagraphs(article.body, article._id)}
        {showGearBtn &&
          <div style={{float: 'right'}} >
            <GearButton id={article._id} handleClick={() => gearButtonClick(article._id)}/>
          </div> }
      </Card.Body>
      <Card.Footer className="text-muted">{article.footer} - {dateUtils.stringToWordDate(article.date)}</Card.Footer>
    </Card>
  )
}

function getCardParagraphs(text, id) {
  let paras = text.split('\n')
  return (
    paras.map((p, index) => getCardTextType(index + id, p))
  )
}

function getCardTextType(id, text) {
  if (text.startsWith(cLinkMask)) {
    const url = text.substring(cLinkMask.length, text.length)
    return <Card.Link href={url} key={'link' + id}>{url}</Card.Link>
  } else {
    return <Card.Text key={'para' + id}>{text}</Card.Text>
  }
}

export default NewsArticle

