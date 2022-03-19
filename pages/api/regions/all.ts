// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Region from '../../../common/Region'

type Data = {
  regions: Region[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const regions = require('../../../data/regions.json')
  res.status(200).json({ regions: regions })
}
