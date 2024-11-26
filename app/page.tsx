import axios from 'axios';
import querystring from 'querystring';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams);
  console.log(filters);
  const codevalue = filters['code'];
  let qtdata = null;
  if (codevalue) {

    const resp = await axios.post('https://login.questrade.com/oauth2/token', querystring.stringify({
      client_id: process.env.QUESTRADE_CLIENT_ID,
      code: codevalue as string,
      grant_type: 'authorization_code',
      redirect_uri: process.env.BASE_URL,
    }));

    const { access_token, api_server } = resp.data;

    const accountsResp = await axios.get(`${api_server}v1/accounts`, {
      headers: {
      Authorization: `Bearer ${access_token}`
      }
    });
    qtdata = (
        <ul>
        {accountsResp.data.accounts.map(async account => {
          const balance = await axios.get(`${api_server}v1/accounts/${account.number}/balances`, {
            headers: {
            Authorization: `Bearer ${access_token}`
            }
          });
          console.log(balance.data);
          return <li key={account.number}>{account.type} {account.number} ({balance.data.combinedBalances[0].totalEquity})</li>
       })}

        </ul>
    );
    // const data = await $response.json();
    //console.log(response);
  }
  return (
    <div className="container">
      <p>
        <a href={`https://login.questrade.com/oauth2/authorize?client_id=${process.env.QUESTRADE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.BASE_URL}`}>Login</a>
      </p>
      {qtdata && qtdata}
    </div>
  );
}
