import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
    resendVerification: (email) => api.post('/auth/resend-verification', { email })
};

// Expense APIs
export const expenseAPI = {
    getAll: (params) => api.get('/expenses', { params }),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    getStats: () => api.get('/expenses/stats')
};

// Budget APIs
export const budgetAPI = {
    get: () => api.get('/budget'),
    update: (monthlyBudget) => api.put('/budget', { monthlyBudget }),
    getStatus: () => api.get('/budget/status')
};

// Group APIs
export const groupAPI = {
    getAll: () => api.get('/groups'),
    create: (data) => api.post('/groups', data),
    getOne: (id) => api.get(`/groups/${id}`),
    addExpense: (id, data) => api.post(`/groups/${id}/expenses`, data),
    getSettlements: (id) => api.get(`/groups/${id}/settlements`),
    joinGroup: (inviteCode) => api.post('/groups/join', { inviteCode }),
    getInviteCode: (id) => api.get(`/groups/${id}/invite-code`)
};

// Friend Split APIs
export const friendSplitAPI = {
    getAll: () => api.get('/friend-splits'),
    create: (data) => api.post('/friend-splits', data),
    settle: (id) => api.put(`/friend-splits/${id}/settle`),
    delete: (id) => api.delete(`/friend-splits/${id}`)
};

// Friendship APIs
export const friendshipAPI = {
    searchUsers: (email) => api.post('/friendships/search', { email }),
    sendRequest: (recipientId) => api.post('/friendships/request', { recipientId }),
    getRequests: () => api.get('/friendships/requests'),
    getFriends: () => api.get('/friendships/friends'),
    acceptRequest: (id) => api.put(`/friendships/${id}/accept`),
    rejectRequest: (id) => api.put(`/friendships/${id}/reject`),
    removeFriend: (id) => api.delete(`/friendships/${id}`)
};

// Analytics APIs
export const analyticsAPI = {
    getData: () => api.get('/analytics'),
    getGuiltySpending: () => api.get('/analytics/guilty')
};

export default api;
