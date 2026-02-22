import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get all production records
export const getProductionLogs = createAsyncThunk(
    'production/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/production');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Add production record
export const addProductionLog = createAsyncThunk(
    'production/add',
    async (productionData, { rejectWithValue }) => {
        try {
            const response = await api.post('/production', productionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Update production record
export const updateProductionLog = createAsyncThunk(
    'production/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/production/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Delete production record
export const deleteProductionLog = createAsyncThunk(
    'production/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/production/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const initialState = {
    logs: [],
    isLoading: true,
    isError: false,
    isSuccess: false,
    message: '',
};

const productionSlice = createSlice({
    name: 'production',
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
            .addCase(getProductionLogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProductionLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload;
            })
            .addCase(getProductionLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addProductionLog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addProductionLog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.logs.unshift(action.payload);
            })
            .addCase(addProductionLog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateProductionLog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProductionLog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.logs.findIndex((log) => log._id === action.payload._id);
                if (index !== -1) {
                    state.logs[index] = action.payload;
                }
            })
            .addCase(updateProductionLog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteProductionLog.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteProductionLog.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.logs = state.logs.filter((log) => log._id !== action.payload);
            })
            .addCase(deleteProductionLog.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = productionSlice.actions;
export default productionSlice.reducer;
