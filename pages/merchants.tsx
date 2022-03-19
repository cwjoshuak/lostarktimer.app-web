import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useEffect, useRef, ReactElement } from 'react'

const merchantRegions = [{}]
const Merchants: NextPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-auto bg-base-300 py-2 dark:bg-base-100">
      What are you doing over here?
      <a href="https://discord.gg/beFb23WgNC">https://discord.gg/beFb23WgNC</a>
    </div>
  )
  return (
    <>
      <Head>
        <title>Merchants - Lost Ark Timer</title>
      </Head>
      <div className="relative flex min-h-screen flex-col items-center overflow-x-auto bg-base-300 py-2 dark:bg-base-100">
        {/* <div className="w-full  px-4 lg:px-20"> */}
        <table className="table-zebra table">
          <thead>
            <tr>
              <th>Wandering Merchants</th>
              <td>Tst</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th></th>
            </tr>
          </tbody>
        </table>
        <a href="https://lostarkcodex.com/us/item/70500000/">Fancier Bouquet</a>
        {/* </div> */}
      </div>
    </>
  )
}

export default Merchants
