import APISTATUS from "../apiconfig";
import { setProducts, setStatus } from "./slice";
import { AsyncThunk } from "@reduxjs/toolkit";

export function fetchProducts() {
    return async function fetchProductThunk(dispatch) {
        dispatch(setStatus(APISTATUS.LOADING))
        try {
            const res = await fetch('https://run.mocky.io/v3/c69de8ec-973b-416e-9751-8ebf8f63c941');
            const data = await res.json()
            dispatch(setProducts(data))
            dispatch(setStatus(APISTATUS.SUCCESS))
        } catch (err) {
            dispatch(setStatus(APISTATUS.ERROR))
        }
    }
}