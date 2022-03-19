// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DateTime, Interval } from 'luxon'
import type { NextApiRequest, NextApiResponse } from 'next'
import Item from '../../../common/Item'
import Region from '../../../common/Region'
import Server from '../../../common/Server'
import WanderingMerchant from '../../../common/WanderingMerchant'

type Data = {
  wanderingMerchants: WanderingMerchant[]
}
const merchantData = require('../../../data/merchants.json')
const merchantSchedules = require('../../../data/merchantSchedules.json')
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { merchant } = req.query
  console.log(merchant)
  let baseURL = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000'

  // let items: Item[] = (await (
  //   await fetch(baseURL + `/items/${merchant}`)
  // ).json()) as unknown as Item[]

  console.log(merchantData)
  console.log(merchantSchedules)

  res.status(200).json({
    wanderingMerchants: [
      new WanderingMerchant(
        'Ben',
        [],
        Interval.fromDateTimes(
          DateTime.now(),
          DateTime.now().plus({ hours: 24 })
        )
      ),
    ],
  })
}
