import { React, useState, useEffect } from 'react'
//https://openbase.com/js/react-image-gallery
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/scss/image-gallery.scss'
import 'react-image-gallery/styles/css/image-gallery.css'
import { ImageModel, Images } from '../models/ImageModel'
import Loading from '../components/Loading'

function Home() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

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
  } else {
    return ( <ImageGallery items={images} /> )
  }
}

/*const HomeContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'center';
`;


<div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
  <h1>On Road Circuit Association</h1>
  <div style={{width: '100%'}}>
    <img style={{maxWidth: '50%', maxHeight: '50%'}} src={CircuitLogo} alt="Circuit Logo"></img>
  </div>  
  <h2> Ireland's only 1/8 scale on road circuit</h2>
  <span>St.Anne's Park, Raheny, Dublin, Ireland</span>
  <div style={{width: '100%', maxHeight: '100%'}}>
    <img style={{maxWidth: '100%', maxHeight: '50%'}} src={SaintAnnesTrack} alt="Saint Annes Track"></img>
  </div>
</div>

const HeaderContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  text-align: centre;
  alignItems: 'center';
  justifyContent: 'center';
`;*/

export default Home
