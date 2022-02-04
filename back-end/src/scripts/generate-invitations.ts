import Axios, { Method } from "axios";
import * as fs from 'fs';

const HOST = 'http://localhost:4200';
// const HOST = 'https://biogasplatform.eu';
const TOKEN = 'aaa.bbb.ccc';

async function request(url: string, method: Method = 'GET', body: any = undefined) {
  try {
    const { data } = await Axios.request({
      url: `${HOST}${url}`,
      method,
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      data: body
    });
    return data;
  } catch (err) {
    return Promise.reject(err.response.data);
  }
}

async function generateInvitations() {
  const { published } = await request(`/api/user/enterprises`);

  const result: string[] = [];

  await Promise.all(
    published.map(async (one: any) => {
      console.log(`Processing ${one.id} ${one.companyName} `);

      const { location, contacts } = await request(`/api/user/enterprises/${one.id}`);

      const email = contacts[0]?.elements.filter((el: any) => el.type === 'email')[0]?.value;
      const phone = contacts[0]?.elements.filter((el: any) => el.type === 'phone')[0]?.value

      const { invites } = await request(`/api/user/enterprises/${one.id}/share`);

      await Promise.all(
        invites.map((inv: any) =>
          request(`/api/user/enterprises/${one.id}/share`, 'DELETE', { invite: inv.id })
        )
      );

      const { id: inviteId } = await request(
        `/api/user/enterprises/${one.id}/share`,
        'POST',
        { name: `${one.companyName} company representative` }
      );

      result.push(
        [
          `${HOST}/enterprises/${one.id}`,
          one.companyName,
          location.country,
          location.city,
          location.address,
          location.zipCode,
          email,
          phone,
          `${HOST}/enterprises/invite/${inviteId}`
        ].join('\t')
      );
    })
  );

  fs.writeFileSync('invitations.csv', result.join('\n'));

  console.log(`Done! Intitation created for ${published.length} companies.`);
}

generateInvitations()
  .catch(err => console.error('ERROR', err))
  .then();
