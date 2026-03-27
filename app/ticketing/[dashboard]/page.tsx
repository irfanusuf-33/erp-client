"use client"

import { useParams } from 'next/navigation'
import React from 'react'

const Dashboard = () => {


 const {dashboard} = useParams()




  return (
    <div>Dashboard : this is {dashboard} </div>
  )
}

export default Dashboard