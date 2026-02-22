import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const getMaterials = createAsyncThunk(
    'materials/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/materials');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const addMaterial = createAsyncThunk(
    'materials/add',
    async (materialData, { rejectWithValue }) => {
        try {
            const response = await api.post('/materials', materialData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const updateMaterial = createAsyncThunk(
    'materials/updateDetails',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/materials/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const deleteMaterial = createAsyncThunk(
    'materials/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/materials/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const updateStock = createAsyncThunk(
    'materials/updateStock',
    async (stockData, { rejectWithValue }) => {
        try {
            const response = await api.post('/materials/update', stockData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const initialState = {
    materials: [],
    isLoading: true,
    isError: false,
    isSuccess: false,
    message: '',
};

const materialSlice = createSlice({
    name: 'materials',
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
            .addCase(getMaterials.pending, (state) => { state.isLoading = true; })
            .addCase(getMaterials.fulfilled, (state, action) => {
                state.isLoading = false;
                state.materials = action.payload;
            })
            .addCase(getMaterials.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addMaterial.pending, (state) => { state.isLoading = true; })
            .addCase(addMaterial.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.materials.unshift(action.payload);
            })
            .addCase(addMaterial.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateMaterial.pending, (state) => { state.isLoading = true; })
            .addCase(updateMaterial.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.materials.findIndex(m => m._id === action.payload._id);
                if (index !== -1) state.materials[index] = action.payload;
            })
            .addCase(updateMaterial.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteMaterial.pending, (state) => { state.isLoading = true; })
            .addCase(deleteMaterial.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.materials = state.materials.filter(m => m._id !== action.payload);
            })
            .addCase(deleteMaterial.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateStock.pending, (state) => { state.isLoading = true; })
            .addCase(updateStock.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.materials.findIndex(m => m._id === action.payload._id);
                if (index !== -1) state.materials[index] = action.payload;
            })
            .addCase(updateStock.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = materialSlice.actions;
export default materialSlice.reducer;
