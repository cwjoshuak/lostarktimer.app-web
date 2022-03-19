import type { NextPage } from 'next'
import React from 'react'

import 'core-js/features/array/at'
type HomeProps = {
  isDown: boolean
  endTime: string
}
const Home: NextPage = (props) => {
  return <></>
}
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const res = await fetch(
//     `${
//       process.env.NEXT_PUBLIC_VERCEL_ENV
//         ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//         : 'http://localhost:3000'
//     }/api/server-maintenance`
//   )
//   const data = await res.json()
//   return { props: data }
// }
export default Home
