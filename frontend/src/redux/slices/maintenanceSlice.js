import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// --- MACHINES ---
export const getMachines = createAsyncThunk('maintenance/getMachines', async (_, { rejectWithValue }) => {
    try { const res = await api.get('/maintenance/machines'); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

export const addMachine = createAsyncThunk('maintenance/addMachine', async (data, { rejectWithValue }) => {
    try { const res = await api.post('/maintenance/machines', data); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

export const updateMachine = createAsyncThunk('maintenance/updateMachine', async ({ id, data }, { rejectWithValue }) => {
    try { const res = await api.put(`/maintenance/machines/${id}`, data); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

export const deleteMachine = createAsyncThunk('maintenance/deleteMachine', async (id, { rejectWithValue }) => {
    try { await api.delete(`/maintenance/machines/${id}`); return id; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

// --- WORK ORDERS ---
export const getWorkOrders = createAsyncThunk('maintenance/getWorkOrders', async (_, { rejectWithValue }) => {
    try { const res = await api.get('/maintenance'); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

export const createWorkOrder = createAsyncThunk('maintenance/createWorkOrder', async (data, { rejectWithValue }) => {
    try { const res = await api.post('/maintenance', data); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

export const updateWorkOrder = createAsyncThunk('maintenance/updateWorkOrder', async ({ id, data }, { rejectWithValue }) => {
    try { const res = await api.put(`/maintenance/${id}`, data); return res.data; }
    catch (err) { return rejectWithValue(err.response.data.message); }
});

const initialState = {
    machines: [],
    workOrders: [],
    isLoading: true,
    isError: false,
    isSuccess: false,
    message: '',
};

const maintenanceSlice = createSlice({
    name: 'maintenance',
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
            // Machines
            .addCase(getMachines.fulfilled, (state, action) => { state.machines = action.payload; })
            .addCase(addMachine.fulfilled, (state, action) => { state.machines.unshift(action.payload); state.isSuccess = true; })
            .addCase(updateMachine.fulfilled, (state, action) => {
                const index = state.machines.findIndex(m => m._id === action.payload._id);
                if (index !== -1) state.machines[index] = action.payload;
            })
            .addCase(deleteMachine.fulfilled, (state, action) => { state.machines = state.machines.filter(m => m._id !== action.payload); })

            // Work Orders
            .addCase(getWorkOrders.pending, (state) => { state.isLoading = true; })
            .addCase(getWorkOrders.fulfilled, (state, action) => { state.isLoading = false; state.workOrders = action.payload; })
            .addCase(createWorkOrder.fulfilled, (state, action) => { state.workOrders.unshift(action.payload); state.isSuccess = true; })
            .addCase(updateWorkOrder.fulfilled, (state, action) => {
                const index = state.workOrders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) state.workOrders[index] = action.payload;
                state.isSuccess = true;
            });
    },
});

export const { reset } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
