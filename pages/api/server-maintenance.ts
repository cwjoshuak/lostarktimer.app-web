import { DateTime } from 'luxon'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  isDown: boolean
  endTime: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let tz = 'America/Los_Angeles'
  let startTime = DateTime.fromObject(
    {
      month: 3,
      day: 17,
      hour: 0,
      minute: 0,
      second: 0,
    },
    { zone: tz }
  )

  let endTime = startTime.plus({ hours: 4 })
  res.status(200).json({
    isDown: false,
    // startTime.diffNow().toMillis() < 0 && endTime.diffNow().toMillis() > 0,
    endTime: endTime.toMillis().toString(),
  })
}
