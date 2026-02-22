import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get all sales
export const getSales = createAsyncThunk(
    'sales/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/sales');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Create new sale
export const createSale = createAsyncThunk(
    'sales/create',
    async (saleData, { rejectWithValue }) => {
        try {
            const response = await api.post('/sales', saleData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Update sale
export const updateSale = createAsyncThunk(
    'sales/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/sales/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Delete sale
export const deleteSale = createAsyncThunk(
    'sales/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/sales/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const initialState = {
    sales: [],
    isLoading: true,
    isError: false,
    isSuccess: false,
    message: '',
};

const salesSlice = createSlice({
    name: 'sales',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSales.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSales.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sales = action.payload;
            })
            .addCase(getSales.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createSale.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSale.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.sales.unshift(action.payload); // Add new sale to top
            })
            .addCase(createSale.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateSale.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateSale.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.sales.findIndex((sale) => sale._id === action.payload._id);
                if (index !== -1) {
                    state.sales[index] = action.payload;
                }
            })
            .addCase(updateSale.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteSale.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteSale.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.sales = state.sales.filter((sale) => sale._id !== action.payload);
            })
            .addCase(deleteSale.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = salesSlice.actions;
export default salesSlice.reducer;
