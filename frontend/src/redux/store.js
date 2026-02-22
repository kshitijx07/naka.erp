import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import salesReducer from './slices/salesSlice';
import productionReducer from './slices/productionSlice';
import productionOrderReducer from './slices/productionOrderSlice';
import salaryReducer from './slices/salarySlice';
import materialReducer from './slices/materialSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        sales: salesReducer,
        production: productionReducer,
        salary: salaryReducer,
        materials: materialReducer,
        maintenance: maintenanceReducer,
        dashboard: dashboardReducer,
        productionOrders: productionOrderReducer,
    },
});
