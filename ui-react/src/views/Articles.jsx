import { React, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
import { ArticleModel } from '../models/ArticleModel'
import Header from '../components/Header'
import NewsArticle from '../components/NewsArticle'
import Form from 'react-bootstrap/Form'
import { Permissions } from '../utils/permissions'
import { DateUtils } from '../utils/DateUtils'

const articleModel = new ArticleModel()
const dateUtils = new DateUtils()
const defaultDate = new Date()
const defaultDateCtrl = dateUtils.formatDate(defaultDate, 'yyyy-mm-dd')

function Article() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [articleId, setArticleId] = useState('')
  const [image, setImage] = useState('')
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [footer, setFooter] = useState('')
  const [date, setDate] = useState(new Date())
  const [dateCtrl, setDateCtrl] = useState(defaultDateCtrl)
  const [data, setData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [allowAddArticles, setAllowAddArticles] = useState(false)
  const [editing, setEditing] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const handleClose = () => {
    setShow(false)
  }
  const handleShow = () => {
    setShow(true)
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      try {
        const permissions = new Permissions()
        setAllowAddArticles(permissions.check(apiToken, 'post', 'articles'))
        const articleModel = new ArticleModel(apiToken)
        await articleModel.get()
        if (articleModel.success) {
          setData(articleModel.responseData)
        } else {
          window.alert(articleModel.message)
        }
      } finally {
        setLoading(false) 
      }  
    }  
    loadData()
  }, [refresh, apiToken, user])

  if (apiToken === '') {
    if (isAuthenticated) {
      getApiToken()  
    }
  } else { 
    articleModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    try { 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      articleModel.setApiToken(token)
      setApiToken(token)   
    } catch(e) {
      console.log(e)
    }
  }

  async function deleteArticle() {
    try {
      if (window.confirm('Are you sure you want to delete this news article?')) {
        await articleModel.delete(articleId)
        if (articleModel.success){
          setRefresh(!refresh)
        } else {
          window.alert(articleModel.message)
        }
      }
    } catch(e) {
      window.alert(e)
    } finally {
      handleClose()
    }
  }

  async function postArticle() {
    try {
      await articleModel.post({ headline, image, date, body, footer })  
      if (articleModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(articleModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  async function putArticle(id) {
    try {
      await articleModel.put(id.toString(), { headline, image, date, body, footer })  
      if (articleModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(articleModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  function findArticle(id) {
    if (data && data.length > 0){
      for (var a of data) {
        if (a._id === id) {
          return a
        }
      }
    } else {
      return
    }
  }

  function editArticle(id) {
    let article = findArticle(id) 
    if (article) {
      setHeadline(article.headline)
      setImage(article.image)
      setDate(article.date)
      setDateCtrl(dateUtils.formatDate(new Date(article.date), 'yyyy-mm-dd')) 
      setBody(article.body)
      setFooter(article.footer)
      setArticleId(id)
      setEditing(true)
      handleShow()
    } else {
      window.alert('error finding article')
    }
  } 

  function addArticle() {
    setEditing(false)
    setHeadline('')
    setImage('')
    setBody('')
    setFooter('')
    setDate(new Date())
    setArticleId('')
    handleShow()
  } 

  function saveArticle(){
    if (editing) {
      putArticle(articleId)
    } else {
      postArticle()
    }
  }

  function headerText(){
    if (editing) {
      return 'Edit Article'
    } else {
      return 'New Article'
    }
  }

  function dateChange(stringDate) {
    let date = new Date(stringDate)
    setDate(date)
    setDateCtrl(stringDate)  
  }

  function modalForm(){
    return (  
      <Modal key='articleForm' show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid' } } >
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control value={image} onChange={(e) => setImage(e.target.value)} type="text" />
            </Form.Group> 
            <Form.Group className="mb-3" >
              <Form.Label>Headline</Form.Label>
              <Form.Control value={headline} type="text" onChange={(e) => setHeadline(e.target.value)}/>
            </Form.Group> 
            <Form.Group className="mb-3">
              <Form.Label>Body</Form.Label>
              <Form.Control value={body} onChange={(e) => setBody(e.target.value)} type="text" as="textarea" style={{height: '8rem'}}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Footer</Form.Label>
              <Form.Control value={footer} onChange={(e) => setFooter(e.target.value)} type="text"/>
            </Form.Group>
            <Form.Group className="mb-3" >
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={dateCtrl} onChange={(e) => dateChange(e.target.value)} id="articleDate" name="article-date" />
            </Form.Group>
          </Form>        
        </Modal.Body>
        <Modal.Footer>
            {editing && <Button onClick={deleteArticle} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> }
            <Button variant="outline-secondary" onClick={handleClose}>Close</Button>
            <Button variant="outline-primary" onClick={saveArticle}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else if (!data || data.length === 0) {
    return ( 
      <div>
        {modalForm()}
        <Header props={{header:'News'}} /> 
        {allowAddArticles &&
          <div onClick={addArticle} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
            <PlusButton /> 
          </div>}
      </div> )
  } else {
    return (
      <div>
        <Header props={{header:'News'}} /> 
        {allowAddArticles &&
          <div onClick={addArticle} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
            <PlusButton /> 
          </div>}
        {modalForm()}
        <div style={{alignSelf: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
          {data && data.length > 0 && data.map((article, index) => (
            <NewsArticle key={`NewsArticle-${article._id}`} props={{article, allowAddArticles, editArticle}} />
          ))}    
        </div>
      </div>
    )
  }
}

export default Article
