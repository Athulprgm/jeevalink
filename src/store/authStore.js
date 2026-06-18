import { create } from 'zustand';
import { useAppStore } from './appStore.js';
import api from './api.js';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('jeevalink_token') || null,
  user: (() => {
    try { return JSON.parse(localStorage.getItem('jeevalink_user') || 'null'); } catch { return null; }
  })(),
  loading: false,
  error: null,

  login: async (credential, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { credential, password });
      const { token, user } = res.data.data;
      localStorage.setItem('jeevalink_token', token);
      localStorage.setItem('jeevalink_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true, role: user.role };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid credentials. Try again.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  googleLogin: async (email, fullName) => {
    set({ loading: true, error: null });
    try {
      // Use a consistent default password for Google authentication simulation
      const dummyPass = 'GoogleUserPassword123!';
      const res = await api.post('/auth/login', { credential: email, password: dummyPass });
      const { token, user } = res.data.data;
      localStorage.setItem('jeevalink_token', token);
      localStorage.setItem('jeevalink_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true, role: user.role };
    } catch (err) {
      // If login fails, user might not exist in db. Attempt registration first!
      try {
        const dummyPass = 'GoogleUserPassword123!';
        const regRes = await api.post('/auth/register', {
          fullName: fullName || 'Google User',
          email,
          mobile: 'G-' + Date.now().toString().slice(-8), // unique dummy mobile
          password: dummyPass,
          role: 'donor',
          city: 'Kochi',
          district: 'Ernakulam',
          bloodGroup: 'O+'
        });
        const { token, user } = regRes.data.data;
        localStorage.setItem('jeevalink_token', token);
        localStorage.setItem('jeevalink_user', JSON.stringify(user));
        set({ token, user, loading: false });
        return { success: true, role: user.role };
      } catch (regErr) {
        const errMsg = regErr.response?.data?.message || 'Google Sign-In failed.';
        set({ loading: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const isHospital = userData.role === 'hospital';
      const mobile = userData.mobileNumber || userData.mobile || '';
      const email = userData.email || (mobile ? `${mobile}@jeevalink.org` : '');

      const formData = new FormData();
      formData.append('full_name', userData.fullName || '');
      formData.append('mobile', mobile);
      formData.append('email', email);
      formData.append('password', userData.password || '');
      formData.append('role', isHospital ? 'hospital' : 'donor');
      formData.append('district', userData.district || '');
      formData.append('city', userData.city || '');
      formData.append('blood_group', userData.bloodGroup || 'N/A');
      
      if (userData.address) formData.append('address', userData.address);
      if (userData.pincode) formData.append('pincode', userData.pincode);
      if (userData.fullAddress) formData.append('full_address', userData.fullAddress);
      if (userData.dateOfBirth) formData.append('dob', userData.dateOfBirth);
      if (userData.weight) formData.append('weight', userData.weight);
      if (userData.lastDonated || userData.lastDonatedDate) {
        formData.append('last_donated_date', userData.lastDonated || userData.lastDonatedDate);
      }
      
      if (userData.idProofFront) formData.append('id_proof_front', userData.idProofFront);
      if (userData.idProofBack) formData.append('id_proof_back', userData.idProofBack);

      const res = await api.post('/auth/register', formData);
      const { token, user } = res.data.data;
      localStorage.setItem('jeevalink_token', token);
      localStorage.setItem('jeevalink_user', JSON.stringify(user));
      set({ token, user, loading: false });
      
      // Sync list in appStore
      useAppStore.getState().addUser(user);
      return { success: true };
    } catch (err) {
      console.error("Registration validation errors:", err.response?.data);
      const errMsg = err.response?.data?.message || 'Registration failed.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  addVolunteer: async (volunteerData) => {
    set({ loading: true });
    try {
      const payload = {
        fullName: volunteerData.fullName,
        email: volunteerData.email,
        mobile: volunteerData.mobile,
        password: volunteerData.password,
        role: 'volunteer',
        district: volunteerData.district,
        city: volunteerData.city || 'Kochi',
        bloodGroup: 'N/A'
      };
      const res = await api.post('/auth/register', payload);
      const { user } = res.data.data;
      
      // Sync list in appStore
      useAppStore.getState().addUser(user);
      set({ loading: false });
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add volunteer.';
      set({ loading: false });
      return { success: false, error: errMsg };
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send reset link.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  resetPassword: async (token, email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/reset-password', { token, email, password });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password.';
      set({ loading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('jeevalink_token');
    localStorage.removeItem('jeevalink_user');
    set({ token: null, user: null, error: null });
  },

  loadProfile: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      const { user } = res.data.data;
      localStorage.setItem('jeevalink_user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    try {
      const res = await api.patch('/auth/profile', updates);
      const { user } = res.data.data;
      localStorage.setItem('jeevalink_user', JSON.stringify(user));
      set({ user, loading: false });
      useAppStore.getState().updateUserInLists(user._id, user);
      return { success: true, user };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      set({ loading: false });
      return { success: false, error: errMsg };
    }
  },

  setAvailability: async (available) => {
    try {
      await api.patch('/auth/toggle-availability');
      const updatedUser = { ...get().user, availableForDonation: available };
      localStorage.setItem('jeevalink_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      useAppStore.getState().updateUserInLists(updatedUser._id, { availableForDonation: available });
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: 'Failed to update availability.' };
    }
  },

  updateMockUserStatus: (userId, status) => {
    const currentUser = get().user;
    if (currentUser && String(currentUser._id) === String(userId)) {
      const updated = { ...currentUser, status };
      localStorage.setItem('jeevalink_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));
