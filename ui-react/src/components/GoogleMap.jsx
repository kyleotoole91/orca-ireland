import React, { Component } from 'react'
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react'

export class GoogleMap extends Component {
  render() {
    return (
      <Map containerStyle={{position: 'relative'}}
           style={{height: '200px', width: '100%', marginTop: '6px', position: 'relative'}}
           google={this.props.google} 
           zoom={15.8}
           initialCenter={{
             lat: 53.372972833,
             lng: -6.174243994
        }}
      >
        <Marker onClick={this.onMarkerClick}
                name={"Saint Anne's Park RC Track"} />
      </Map>
    )
  }
}
 
export default GoogleApiWrapper({
  apiKey: (process.env.REACT_APP_API_GAPI_KEY)
})(GoogleMap)
