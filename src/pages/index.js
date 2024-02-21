import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from "@/api/products/thunk"
import APISTATUS from "@/api/apiconfig"

export default function Home() {
  const dispatch = useDispatch()
  const { data: products, status } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [])

  return (
    <>
      <h1>Home Page</h1>
      {status === APISTATUS.LOADING && <h2>LOADING ...</h2>}
      {status === APISTATUS.SUCCESS && <h2>{products?.message}</h2>}
      {status === APISTATUS.ERROR && <h2>Something went wrong</h2>}
    </>
  )
}