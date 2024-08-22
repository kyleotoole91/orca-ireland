import { React, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { SeasonModel } from '../models/SeasonModel'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import DataTable from 'react-data-table-component'
import { globalDataTableStyle } from '../styles/componentStyles.js'

function SeasonReport() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [seasonBbkReport, setSeasonBbkReport] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
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
    loadData()
  }, [id, apiToken, user])

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
      name: 'Rounds',
      selector: row => row.roundCount,
      sortable: true,
    },
    {
      name: 'Total Laps',
      width: '8rem',
      selector: row => row.totalLaps,
      sortable: true,
    },
    {
      name: 'Avrg Lap',
      width: '8rem',
      selector: row => row.avrgLap,
      sortable: true,
    },
    {
      name: 'Best Sec',
      width: '8rem',
      selector: row => row.bestLap,
      sortable: true,
    },
    {
      name: 'Best Kph',
      width: '8rem',
      selector: row => row.bestLapKph,
      sortable: true,
    },
    {
      name: 'Improvement (sec)',
      width: '11rem',
      selector: row => row.improvSec,
      sortable: true,
    },
    {
      name: 'Consistency (%)',
      width: '10rem',
      selector: row => row.consistPct,
      sortable: true,
    },
  ];

  const expColumns = [
    {
      name: 'Event',
      width: '18rem',
      selector: row => row.event,
      sortable: true,
    },
    {
      name: 'Race',
      selector: row => row.name,
      width: '18rem',
      sortable: true,
    },
    {
      name: 'Position',
      selector: row => row.pos,
      sortable: true,
    },
    {
      name: 'Laps',
      selector: row => row.lapCount,
      sortable: true,
    },
    {
      name: 'Average Sec',
      selector: row => row.avrgLap,
      width: '8rem',
      sortable: true,
    },
    {
      name: 'Best Sec',
      selector: row => row.bestLap,
      sortable: true,
    },
    {
      name: 'Best Kph',
      selector: row => row.bestLapKph,
      sortable: true,
    },
    {
      name: 'Consistency (%)',
      width: '10rem',
      selector: row => row.consistPct,
      sortable: true,
    },
  ]

  const expColumns2 = [
    {
      name: 'Lap Time',
      selector: row => row,
      width: '8rem',
      sortable: true,
    }
  ]

  const ExpandedLaps = ({ data }) => { 
    return ( 
      <div key={data.name} style={{marginLeft: '18px', marginRight: '18px'}}>
        {GenDataTable('Laps', expColumns2, data.laps)}
      </div>
    )
  }

  const ExpandedDriver = ({ data }) => { 
    return ( 
      <div key={data.class} style={{marginLeft: '18px', marginRight: '18px'}}>
        {GenExpDataTable('Races', expColumns, data.races, ExpandedLaps)}
      </div>
    )
  }

  function GenExpDataTable(headerName, columns, data, expComp) {
    return ( 
      <DataTable
        dense
        customStyles={globalDataTableStyle}
        key={headerName}
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
        dense
        customStyles={globalDataTableStyle}
        key={headerName}
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
                      subHeader: dayjs(seasonBbkReport.season.startDate).format('DD/MM/YYYY') +' -> '+
                                 dayjs(seasonBbkReport.season.endDate).format('DD/MM/YYYY'),
                    }} /> 
      <div style={{alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
      {seasonBbkReport.classes.map((item) => {
        return GenExpDataTable(item.class, columns, item.racesByRacer, ExpandedDriver)
      })}
      </div>
      </>
  } else return <h2>Not found</h2>
}

export default SeasonReport