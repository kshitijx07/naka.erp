import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get all salaries
export const getSalaries = createAsyncThunk(
    'salary/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/salary');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Generate Salary
export const generateSalary = createAsyncThunk(
    'salary/generate',
    async (salaryData, { rejectWithValue }) => {
        try {
            const response = await api.post('/salary/generate', salaryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Update Salary
export const updateSalary = createAsyncThunk(
    'salary/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/salary/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Delete Salary
export const deleteSalary = createAsyncThunk(
    'salary/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/salary/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const initialState = {
    salaries: [],
    isLoading: true,
    isError: false,
    isSuccess: false,
    message: '',
};

const salarySlice = createSlice({
    name: 'salary',
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
            .addCase(getSalaries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSalaries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.salaries = action.payload;
            })
            .addCase(getSalaries.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(generateSalary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(generateSalary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.salaries.unshift(action.payload);
            })
            .addCase(generateSalary.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateSalary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.salaries.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.salaries[index] = action.payload;
                }
            })
            .addCase(deleteSalary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.salaries = state.salaries.filter(s => s._id !== action.payload);
            });
    },
});

export const { reset } = salarySlice.actions;
export default salarySlice.reducer;
