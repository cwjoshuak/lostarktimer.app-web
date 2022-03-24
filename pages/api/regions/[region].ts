// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DateTime, Interval } from 'luxon'
import type { NextApiRequest, NextApiResponse } from 'next'
import Region from '../../../common/Region'
import Server from '../../../common/Server'

type Data = {
  servers: Server[]
}
const merchantData = require('../../../data/merchants.json')
const merchantSchedules = require('../../../data/merchantSchedules.json')
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const regions: {
    [key: string]: Server[]
  } = require('../../../data/regions.json')

  const { region } = req.query
  let baseURL = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000'

  const servers = regions[region as string]
  if (servers) {
    res.status(200).json({
      servers: servers,
    })
  }
  res.status(400).end('400 bad request')
}
