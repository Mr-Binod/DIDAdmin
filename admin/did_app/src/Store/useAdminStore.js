import { create } from "zustand";

export const useAdminRequestStore = create((set) => ({
    requests : [],
    setRequests : (newRequest) => set(() => ({ requests: newRequest }))
}));

export const useAdminInfoStore = create((set) => ({
    admin : null,
    setAdmin : (newInfo) => set(() => ({ admin: newInfo }))
    
}));

export const useIsSuperAdminStore = create((set) => ({
    isSuperAdmin : false,
    setIsSuperAdmin : (newValue) => set(() => ({ isSuperAdmin: newValue }))    
}));

export const useStatusFilterStore = create((set) => ({
    statusFilter : "pending",
    setStatusFilter : (newValue) => set(() => ({statusFilter : newValue}))
}))

export const useApprovedAdminsStore = create((set) => ({
    admins : [],
    setAdmins : (newAdmins) => set(() => ({ admins: newAdmins }))
}));