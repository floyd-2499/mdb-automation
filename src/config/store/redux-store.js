import { configureStore } from "@reduxjs/toolkit";
import productReducer from '../../api/products/slice'

const reduxStore = configureStore({
    reducer: {
        products: productReducer
    }
})

export default reduxStore