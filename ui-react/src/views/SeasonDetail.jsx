import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { SeasonModel } from '../models/SeasonModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'
import dayjs from 'dayjs'
import { useHistory } from 'react-router-dom'


function SeasonDetail() {
  let { id } = useParams()
  const history = useHistory()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [season, setSeason] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const seasonModel = new SeasonModel(apiToken)
          await seasonModel.getSeasonResults(id)
          if (seasonModel.success) {
            setSeason(seasonModel.responseData)
          } else {
            setSeason()
            window.alert(seasonModel.message)
            history.push('/seasons')
          }
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [id, apiToken, user.sub, history])

  async function getApiToken() {
    try { 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      setApiToken(token)   
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }
  }

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  }

  function addDrivers(standings) {
    function addTableRow(standing, index){
      return (
        <tr key={index+'-driversRow'}>
          <td>{index+1}</td>
          <td>{standing.driverName}</td>
          <td>{standing.eventCount}</td>
          <td>{standing.manufacturers.toString()}</td>
          <td>{standing.totalPoints}</td>
          <td>{standing.bestOfPoints}</td>
        </tr>
      )
    }  
    standings.sort((a, b) => parseFloat(b.bestOfPoints) - parseFloat(a.bestOfPoints)) //sort desc by bestOfPoints
    return (standings.map((standing, index) => ( 
       addTableRow(standing, index) 
    ))) 
  }

  function showDriverStandings() {
    return (
      season.classResults.map((classResult, index) => (
          <div key={index+'-div'}>
            <h2 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={index+'-header-label'}>{classResult.className}</h2> 
            <Table striped bordered hover size="sm" key={index+'-roster'}>
              <thead key={index+'-roster-head'}>
                <tr key={index+'-roster-row'}>
                  <th>Pos</th>
                  <th>Name</th>
                  <th>Rounds Entered</th>
                  <th>Cars Used</th>
                  <th>Total Points</th>
                  <th>Best Points</th>
                </tr>
              </thead>
              <tbody>
                {addDrivers(classResult.standings)}
              </tbody>
            </Table>
            <div style={{height: '25px'}}></div>
          </div>
        )
      )
    )
  }

  if (loading) {
    return <Loading /> 
  } else if (season) {
    return <>
      <Header props={{header: `${season.name}`, 
                      subHeader: dayjs(season.startDate).format('DD/MM/YYYY') +' -> '+
                                 dayjs(season.endDate).format('DD/MM/YYYY'),
                      subHeader3: `Best ${season.bestOf}/${season.eventCount} rounds`,
                    }} /> 
      <div style={{position: 'relative', width: 'auto', height: 'auto', maxWidth: '900px'}}>
      {season &&
       season.hasOwnProperty('classResults') && 
       showDriverStandings()}
      </div>
      </>
  } else return <h2>Not found</h2>
}

export default withAuthenticationRequired(SeasonDetail, { onRedirecting: () => (<Loading />) })