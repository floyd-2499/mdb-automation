import React from "react"
import APISTATUS from "@/api/apiconfig"

const Products = ({ products, status }) => {
    return (
        <>
            <h1>Products Page</h1>
            {status === APISTATUS.LOADING && <h2>LOADING ...</h2>}
            {status === APISTATUS.SUCCESS && <h2>{products?.message}</h2>}
            {status === APISTATUS.ERROR && <h2>Something went wrong</h2>}
        </>
    )
}

export async function getServerSideProps() {
    try {
        const response = await fetch('https://run.mocky.io/v3/c69de8ec-973b-416e-9751-8ebf8f63c941');
        const data = await response.json();

        if (response.ok) {
            return {
                props: {
                    products: data,
                    status: APISTATUS.SUCCESS,
                },
            };
        } else {
            throw new Error('Error loading data from the API');
        }
    } catch (error) {
        return {
            props: {
                products: null,
                status: APISTATUS.ERROR,
            },
        };
    }
}

export default Products;
