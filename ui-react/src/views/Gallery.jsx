import { React, useState, useEffect } from 'react'
import ImageGallery from 'react-image-gallery' //https://openbase.com/js/react-image-gallery
import 'react-image-gallery/styles/scss/image-gallery.scss'
import 'react-image-gallery/styles/css/image-gallery.css'
import { ImageModel } from '../models/ImageModel'
import { VideoModel } from '../models/VideoModel'
import Loading from '../components/Loading'

function Home() {
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      try {
        const imageModel = new ImageModel()
        const videoModel = new VideoModel()
        await imageModel.get()
        if (imageModel.success) {
          if (imageModel.responseData.length > 0) {
            setImages(imageModel.responseData)
          }
        } else {
          window.alert(imageModel.message)
        }
        await videoModel.get()
        if (videoModel.success) {
          if (videoModel.responseData.length > 0) {
            setVideos(videoModel.responseData)
          }
        } else {
          window.alert(videoModel.message)
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
        <div>
          <h2 style={{textAlign: 'center'}}>Photos</h2> 
          <ImageGallery items={images} lazyLoad={true} thumbnailPosition='left' /> 
        </div>
        <div style={{marginTop: '6px', textAlign: 'center'}}>
          <h4 style={{marginBottom: '12px', marginTop: '12px'}}>Videos</h4>
          {videos && videos.length > 0 && videos.map((video, index) => (
            <div key={'div-vid-' + index}>
              {video.hasOwnProperty('description') && <h6 key={'heading-' + index}>{video.description}</h6>}
              <video key={'video-' + index} style={{width: '100%', maxWidth: '1230px', padding: '6px'}} controls src={video.url} />
            </div>
          ))}  
        </div> 
      </>
    )
  }
}

export default Home
