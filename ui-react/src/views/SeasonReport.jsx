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
          const transformedData = addEventsGroup(seasonModel.responseData);
          setSeasonBbkReport(transformedData)
        } else {
          window.alert(seasonModel.message)
        }
      } finally {
        setLoading(false)
      }
    }  
    loadData()
  }, [id, apiToken, user])

  const addEventsGroup = (data) => {
    data.classes.forEach((item) => {
      item.racesByRacer.forEach((driver) => {
        const races = driver.races ?? [];
        const raceMap = new Map();

        races.forEach((item) => {
          let racesByEvent = raceMap.get(item.event);
          
          if (!racesByEvent) {
            racesByEvent = [];
          }
          racesByEvent.push(item);
          raceMap.set(item.event, racesByEvent);
        })

        driver.events = Array.from(raceMap, ([name, races]) => ({ name, races }));
        driver.events.forEach((item) => {
          let tmp = item.races.reduce(
            (accumulator, currentValue) => accumulator + currentValue.avrgLap,
            0,
          );
          item.avrgLap = (tmp / item.races.length).toFixed(3);

          tmp = item.races.reduce(
            (accumulator, currentValue) => accumulator + currentValue.avrgLapKph,
            0,
          );
          item.avrgLapKph = (tmp / item.races.length).toFixed(3);

          tmp = item.races.reduce(
            (accumulator, currentValue) => accumulator + currentValue.avrgLapKph,
            0,
          );
          item.avrgLapKph = (tmp / item.races.length).toFixed(3);

          tmp = item.races.reduce(
            (accumulator, currentValue) => accumulator + currentValue.consistPct,
            0,
          );
          item.consistPct = (tmp / item.races.length).toFixed(3);

          tmp = item.lapCount || 0 + item.races.reduce(
            (accumulator, currentValue) => accumulator + currentValue.lapCount,
            0,
          );
          item.lapCount = tmp;

          const sortedByBestLap = item.races.sort((a, b) => a.bestLap - b.bestLap)
          item.bestLap = sortedByBestLap[0].bestLap;
          item.bestLapKph = sortedByBestLap[0].bestLapKph;
        });
      })
    })

    return data;
  };

  console.log('seasonBbkReport', seasonBbkReport)

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

  const driverColumns = [
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
      width: '7rem',
    },
    {
      name: 'Events',
      selector: row => row.roundCount,
      sortable: true,
      width: '6rem',
    },
    {
      name: 'Laps',
      width: '5rem',
      selector: row => row.totalLaps,
      sortable: true,
    },
    {
      name: 'Avrg Lap',
      width: '7rem',
      selector: row => row.avrgLap,
      sortable: true,
    },
    {
      name: 'Best Sec',
      width: '7rem',
      selector: row => row.bestLap,
      sortable: true,
    },
    {
      name: 'Best Kph',
      width: '7rem',
      selector: row => row.bestLapKph,
      sortable: true,
    },
    {
      name: 'Improv. (sec)',
      width: '9rem',
      selector: row => row.improvSec,
      sortable: true,
    },
    {
      name: 'Consistency',
      width: '8rem',
      selector: row => row.consistPct,
      sortable: true,
    },
  ];

  const eventColumns = [
    {
      id: 'Event',
      name: 'Event',
      width: '18rem',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Laps',
      selector: row => row.lapCount,
      sortable: true,
      width: '5rem',
    },
    {
      name: 'Avrg Sec',
      selector: row => row.avrgLap,
      width: '7rem',
      sortable: true,
    },
    {
      name: 'Best Sec',
      selector: row => row.bestLap,
      sortable: true,
      width: '7rem',
    },
    {
      name: 'Best Kph',
      selector: row => row.bestLapKph,
      sortable: true,
      width: '7rem',
    },
    {
      name: 'Consistency',
      width: '10rem',
      selector: row => row.consistPct,
      sortable: true,
      width: '8rem',
    },
  ]

  const raceColumns = [
    {
      name: 'Race',
      selector: row => row.name,
      width: '17rem',
      sortable: true,
    },
    {
      name: 'Pos',
      selector: row => row.pos,
      width: '5rem',
      sortable: true,
    },
    {
      name: 'Laps',
      selector: row => row.lapCount,
      sortable: true,
      width: '5rem',
    },
    {
      name: 'Avrg Sec',
      selector: row => row.avrgLap,
      width: '8rem',
      sortable: true,
      width: '7rem',
    },
    {
      name: 'Best Sec',
      selector: row => row.bestLap,
      sortable: true,
      width: '7rem',
    },
    {
      name: 'Best Kph',
      selector: row => row.bestLapKph,
      sortable: true,
      width: '7rem',
    },
    {
      name: 'Consistency',
      width: '8rem',
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
        {GenExpDataTable('Events', eventColumns, data.events, ExpandedEvent, 'Event')}
      </div>
    )
  }

  const ExpandedEvent = ({ data }) => { 
    return ( 
      <div key={data.class} style={{marginLeft: '18px', marginRight: '18px'}}>
        {GenExpDataTable('Races', raceColumns, data.races, ExpandedLaps)}
      </div>
    )
  }

  function GenExpDataTable(headerName, columns, data, expComp, defaultSortFieldId) {
    return ( 
      <DataTable
        dense
        defaultSortFieldId={defaultSortFieldId}
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
  } 
  
  if (seasonBbkReport) {
    return <>
      <Header props={{header: `Season Statistics`}}/> 
      <Header props={{header: `${seasonBbkReport.season.name}`, 
        subHeader: dayjs(seasonBbkReport.season.startDate).format('DD/MM/YYYY') +' -> '+
          dayjs(seasonBbkReport.season.endDate).format('DD/MM/YYYY'),
      }} /> 
      <div style={{alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
        {seasonBbkReport.classes.map((item) => {
          return GenExpDataTable(item.class, driverColumns, item.racesByRacer, ExpandedDriver)
        })}
      </div>
    </>
  } 

  return <h2>Not found</h2>
}

export default SeasonReport