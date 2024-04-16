import { React, useState, useEffect } from 'react'
import DataTable from 'react-data-table-component';
import { DateUtils } from '../utils/DateUtils';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import { Permissions } from '../utils/permissions'
import { useAuth0 } from "@auth0/auth0-react"

const MAX_DAYS = 30; 
const DEF_DAYS = 7; 
const PAYPAL_MAX_RECS = 500; 
const dateUtils = new DateUtils()
const today = new Date();
const defaultStartDate = new Date(today.getTime() - DEF_DAYS * 24 * 60 * 60 * 1000);
const defaultStartDateCtrl = dateUtils.formatDate(defaultStartDate, 'yyyy-mm-dd');
const defaultEndDateCtrl = dateUtils.formatDate(new Date(), 'yyyy-mm-dd');

const columns = [
  {
    name: 'Name',
    width: '10rem',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Amount',
    width: '6rem',
    selector: row => row.amount,
    sortable: true,
  },
  {
    name: 'Date',
    width: '12rem',
    selector: row => row.displayDate,
    sortable: false,
  },
  {
    name: 'New Balance',
    width: '8rem',
    selector: row => row.available_balance,
    sortable: true,
  },
  {
    name: 'Note',
    selector: row => row.note,
    sortable: true,
  }
];

export const PaypalTxSearchTable = () => {
  const { getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(defaultStartDateCtrl);
  const [endDate, setEndDate] = useState(defaultEndDateCtrl);
  const [keyword, setKeyword] = useState('');
  const [payerName, setPayerName] = useState('');
  const [data, setData] = useState();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    async function retrieveToken () {
      if (apiToken === '') {
        const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
        setApiToken(token);
      }
    }  
    retrieveToken();
  }, []);

  const dateRangeLimitExceeded = () => {
    const startDateObj = dateUtils.stringToDate(startDate);
    const endDateObj = dateUtils.stringToDate(endDate);
    const dayDiff = (endDateObj - startDateObj) / (24 * 60 * 60 * 1000);
    return dayDiff > MAX_DAYS;
  }

  const getTitle = () => data.length === 0 ? `Paypal Transactions` : `Paypal Transactions (${data.length})`;

  const handleSearchClick = async () => {
    try {
      if (apiToken === '') {
        window.alert('Please log in to search Paypal transactions');
      }
      const permissions = new Permissions();
      if (!permissions.check(apiToken, 'get', 'paypal')) {
        window.alert('Insufficient privellages');
        return;
      }
      if (dateRangeLimitExceeded()) {
        window.alert(`Date range must not exceed ${MAX_DAYS} days`);
        return;
      }
      setLoading(true);
      const startDateQry = startDate === '' ? '' : `?start_date=${startDate}`;
      const endDateQry = endDate === '' ? '' : `&end_date=${endDate}`;
      const keywordQry = keyword === '' ? '' : `&keyword=${keyword}`;
      const nameQry = payerName === '' ? '' : `&name=${payerName}`;
      const amountQry = amount === '' ? '' : `&amount=${parseFloat(amount).toFixed(2)}`;
      const paypalTxUrl = `${process.env.REACT_APP_API_URL}/paypal/transactions${startDateQry}${endDateQry}${keywordQry}${nameQry}${amountQry}`;

      const response = await fetch(paypalTxUrl, {
          method: 'GET', 
          headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"}
        }
      ).then(response => response.json());

      if (!response.success) {
        window.alert(response.message);
        setData([]);
        setLoading(false);
        return;
      }

      if (response.data.length > PAYPAL_MAX_RECS) {
        window.alert(`Warning: ${response.data.length} records found but only ${PAYPAL_MAX_RECS} displayed. Please refine your search.`);
      }

      const mappedData = response.data.map(tx => {
        return {
          ...tx,
          date: dateUtils.stringToDate(tx.date),
          displayDate: dateUtils.stringToWordDateTime(tx.date)
        }
      });
      mappedData.sort((a, b) => b.date - a.date);
      setData(mappedData);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setData([]);
      setLoading(false);
    }
  }

  return ( 
    <>
      <Card style={{margin: '3px', width: '100%'}}>
      <Card.Header>Search Paypal Transactions</Card.Header>
        <Card.Body>
          <Form style={{width: '100%'}}>
            <Form.Group className="mb-3" controlId="ppFrmStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ppFrmEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ppFrmKeyword" >
              <Form.Label>Keyword</Form.Label>
              <Form.Control type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ppFrmName" >
              <Form.Label>Payer Name</Form.Label>
              <Form.Control type="text" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ppFrmAmount">
              <Form.Label>Amount </Form.Label>
              <Form.Control value={amount} type="number" name="event-fee" onChange={(e) => setAmount(e.target.value)} />
            </Form.Group> 
          </Form>
          { loading && <Loading /> } 
          <Button style={{float: 'right'}} variant="outline-primary" onClick={() => handleSearchClick()}>Search</Button>
        </Card.Body>
      </Card>
      
      { data && 
        <DataTable
          title={getTitle()}
          columns={columns}
          data={data}
          pagination={false}
          highlightOnHover
          pointerOnHover
        />
      }
    </>
  );
}