
"use client"

import { useParams } from 'next/navigation'
import React from 'react'

const ClientDetails = () => {


 const {id} = useParams();

  return (
    <div>ClientDetails of {id}</div>
  )
}

export default ClientDetails