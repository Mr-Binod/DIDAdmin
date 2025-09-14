import { create } from "zustand";

export const useAdminRequestStore = create((set) => ({
    requests: [],
    setRequests: (newRequest) => set((prev) => ({ ...prev, requests: newRequest }))
}));

export const useAdminInfoStore = create((set) => ({
    admin: null,
    setAdmin: (newInfo) => set((prev) => ({ ...prev, admin: newInfo }))

}));

export const useIsSuperAdminStore = create((set) => ({
    isSuperAdmin: false,
    setIsSuperAdmin: (newValue) => set((prev) => ({ ...prev, isSuperAdmin: newValue }))
}));

export const useStatusFilterStore = create((set) => ({
    statusFilter: "pending",
    setStatusFilter: (newValue) => set((prev) => ({ ...prev, statusFilter: newValue }))
}))

export const useWebSocket = create((set, get) => ({
    socket: null,
    setSocket: (data) => set((prev) => ({ ...prev, socket: data })),
}))

export const useNotificationData = create((set, get) => ({
    notification: [],
    setNotification: (data) =>
        set((prev) => ({
                ...prev,
                notification: [...prev.notification, data], // push new item
        })),

    setNotificationDelete : () => set(() => ({notification : []})),
    setNotificationAllRead : () => set((prev) => prev.map((n) => ({ ...n, read: true })))
}))

export const useMessageData = create((set, get) => ({
    message: null,
    setMessage: (data) =>
        set((prev) => ({
            ...prev,
            message: data
        })),
}))