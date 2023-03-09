import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { SeasonModel } from '../models/SeasonModel'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import DataTable from 'react-data-table-component'

function SeasonReport() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [seasonBbkReport, setSeasonBbkReport] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const seasonModel = new SeasonModel(apiToken)
          await seasonModel.getSeasonBbkReport(id)
          if (seasonModel.success) {
            setSeasonBbkReport(seasonModel.responseData)
          } else {
            window.alert(seasonModel.message)
          }
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [id, apiToken, user.sub])

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

  const columns = [
    {
        name: 'Name',
        width: '10rem',
        selector: row => row.name,
        sortable: true,
    },
    {
        name: 'Podiums',
        selector: row => row.podiums,
        sortable: true,
    },
    {
        name: 'Total Laps',
        width: '8rem',
        selector: row => row.totalLaps,
        sortable: true,
    },
    {
      name: 'Improvement (sec)',
      width: '10rem',
      selector: row => row.improvSec,
      sortable: true,
    },
    {
      name: 'Consistency (%)',
      width: '9rem',
      selector: row => row.consistPct,
      sortable: true,
    },
    {
      name: 'Rounds',
      selector: row => row.roundCount,
      sortable: true,
    },
  ];

  const expColumns = [
    {
        name: 'Event',
        width: '14rem',
        selector: row => row.event,
        sortable: true,
    },
    {
        name: 'Race',
        selector: row => row.race,
        width: '16rem',
        sortable: true,
    },
    {
        name: 'Average Lap',
        width: '8rem',
        selector: row => row.avrgLap,
        sortable: true,
    },
    {
        name: 'Best Lap',
        selector: row => row.bestLap,
        sortable: true,
    }
  ];

  const ExpandedRaces = ({ data }) => { 
    return ( 
      <div style={{marginLeft: '12px', marginRight: '12px'}}>
        {GenDataTable('Races', expColumns, data.races)}
      </div>
    )
  }

  function GenExpDataTable(headerName, columns, data, expComp) {
    return ( 
      <DataTable
        title={headerName}
        columns={columns}
        data={data}
        expandableRows 
        expandableRowsComponent={expComp}
      />
    )
  }

  function GenDataTable(headerName, columns, data) {
    return ( 
      <DataTable
        title={headerName}
        columns={columns}
        data={data}
      />
    )
  }

  if (loading) {
    return <Loading /> 
  } else if (seasonBbkReport) {
    return <>
      <Header props={{header: `${seasonBbkReport.season.name}`, 
                      subHeader: dayjs(seasonBbkReport.startDate).format('DD/MM/YYYY') +' -> '+
                                 dayjs(seasonBbkReport.season.endDate).format('DD/MM/YYYY'),
                    }} /> 
      <div style={{alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
      {GenExpDataTable('Driver Performance', columns, seasonBbkReport.racesByRacer, ExpandedRaces)}
      </div>
      </>
  } else return <h2>Not found</h2>
}

export default withAuthenticationRequired(SeasonReport, { onRedirecting: () => (<Loading />) })