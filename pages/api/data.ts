import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: JSON
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(401).end('400 bad request')
  // res.status(200).json(require('../../data/data.json'))
}
