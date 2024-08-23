import { React, useState, useEffect, useMemo } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { SeasonModel } from '../models/SeasonModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'
import dayjs from 'dayjs'
import { useHistory } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

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
    loadData()
  }, [id, apiToken, user, history])

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
    if (isAuthenticated) {
      getApiToken()
    }
  }

  function addDrivers(standings) {
    function addTableRow(standing, index){
      return (
        <tr key={index+'-driversRow'}>
          <td>{index+1}</td>
          <td style={{textAlign: 'left'}}>{standing.driverName}</td>
          <td>{standing.eventCount}</td>
          <td style={{textAlign: 'left'}}>{standing.manufacturers.toString()}</td>
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

  const classesWithResults = useMemo(() => {
    if (season && season.hasOwnProperty('classResults')) {
      return season.classResults.filter((classResult) => classResult.standings.length > 0)
    }
  }, [season]);

  function showDriverStandings() {
    return (
      classesWithResults.map((classResult, index) => (
          <div style={{ alignSelf: 'center'}} key={index+'-div'}>
            <h2 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={index+'-header-label'}>{classResult.className}</h2> 
            <Table striped bordered hover size="sm" key={index+'-roster'}>
              <thead key={index+'-roster-head'}>
                <tr key={index+'-roster-row'}>
                  <th>Pos</th>
                  <th>Name</th>
                  <th>Rounds Entered</th>
                  <th>Manufacturer</th>
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

  function bbkUrl(season) {
    return process.env.REACT_APP_BBK_ROOT_DIR + '/' + season.bbkSeasonDir +'/' + process.env.REACT_APP_BBK_INDEX_HTML
  }

  function bbkReportUrl(seasonId) {
    history.push(`/seasons/${seasonId}/reports/bbk`)
  }

  function detailsButton(season) {
    return (
      <Button id={season._id} onClick={(e) => bbkReportUrl(e.target.id)} style={{marginBottom: "6px", marginTop: "6px", marginRight:'3px', width: "100%", maxWidth: "15rem"}} variant="outline-primary">
        Season Statistics
      </Button> 
    )
  }

  function bbkWebPublishButton(season) {
    return (
      <Button id='bbkWebPublishBtn' href={bbkUrl(season)} style={{marginBottom: "6px", marginTop: "6px", marginRight:'3px', width: "100%", maxWidth: "15rem"}} variant="outline-primary">
        BBK Direct Link
      </Button> 
    )
  }
  
  if (loading) {
    return <Loading /> 
  } else if (season) {
    return <>
      <Header props={{header: `${season.name}`, 
                      subHeader: dayjs(season.startDate).format('DD/MM/YYYY') +' -> '+
                                 dayjs(season.endDate).format('DD/MM/YYYY'),
                      //subHeader3: `Best ${season.bestOf}/${season.eventCount} rounds`,
                    }} /> 
      {season.hasOwnProperty('bbkURL') && 
        <div style={{display: 'flex', flexFlow: 'wrap', justifyContent: 'center'}}>
          {detailsButton(season)}
          {bbkWebPublishButton(season)}
        </div> }
      <div style={{alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
        {season && season.hasOwnProperty('classResults') && showDriverStandings()}
      </div>
      {season && !!season.bbkSeasonDir && 
        <iframe style={{width: '100%', height: '40rem'}} src={bbkUrl(season)} ></iframe>
      }
    </>
  } else return <h2>Not found</h2>
}

export default SeasonDetail