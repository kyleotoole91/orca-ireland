import { React, useState, useEffect } from 'react'
import ImageGallery from 'react-image-gallery' //https://openbase.com/js/react-image-gallery
import 'react-image-gallery/styles/scss/image-gallery.scss'
import 'react-image-gallery/styles/css/image-gallery.css'
import { ImageModel } from '../models/ImageModel'
import Loading from '../components/Loading'

function Home() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      try {
        const imageModel = new ImageModel()
        await imageModel.get()
        if (imageModel.success) {
          if (imageModel.responseData.length > 0) {
            setImages(imageModel.responseData)
          }
        } else {
          window.alert(imageModel.message)
        }
      } finally {
        setLoading(false)
      }
    }  
    loadData()
  }, [])

  if (loading) {
    return ( <Loading /> )
  } else if (images.length === 0) {
  return (
    <h2>No images</h2>)
  } else {
    return (
      <>
        <div style={{width:'100%', height:'100%', alignItems: 'center', position: 'absolute'}}> 
          <ImageGallery items={images} lazyLoad={true} thumbnailPosition='left' /> 
        </div>
      </>
    )
  }
}

export default Home
