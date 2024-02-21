import { createSlice } from "@reduxjs/toolkit";
import APISTATUS from "../apiconfig";

const productSlice = createSlice({
    name: "products",
    initialState: {
        data: [],
        status: APISTATUS.SUCCESS
    },
    reducers: {
        setProducts(state, action) {
            state.data = action.payload;
        },
        setStatus(state, action) {
            state.status = action.payload;
        },
    },
});

export const { setProducts, setStatus } = productSlice.actions;
export default productSlice.reducer;
