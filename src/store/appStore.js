import { create } from 'zustand';
import api from './api.js';

export const useAppStore = create((set, get) => ({
  requests: [],
  donors: [],
  notifications: [],
  allUsers: [],
  complaints: [],
  partners: [],
  activeView: 'Splash',
  searchRadius: 15,
  selectedBloodGroup: 'B+',
  toast: { show: false, message: '', type: 'success' },

  // Admin Panel State
  adminStats: {
    pendingRequests: 0,
    pendingFeedback: 0,
    openTickets: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
  },

  fetchAdminStats: async () => {
    try {
      const state = get();
      const pendingRequests = state.requests.filter(r => r.status === 'Pending').length;
      const totalVolunteers = state.allUsers.filter(u => u.role === 'volunteer').length;
      const activeVolunteers = state.allUsers.filter(u => u.role === 'volunteer' && u.status === 'Active').length;
      set({
        adminStats: {
          pendingRequests,
          pendingFeedback: 0,
          openTickets: 0,
          totalVolunteers,
          activeVolunteers,
        }
      });
    } catch (err) {
      console.error('Failed to compute admin stats', err);
    }
  },

  // Firebase Emergency Alert System state
  emergencyRequests: [],
  nearbyDonors: [],
  liveDonorCount: 0,
  emergencyDetails: null,

  // Global SOS properties
  sosCountdownActive: false,
  sosCountdown: 3,
  sirenPlaying: false,
  sosTimer: null,

  setActiveView: (view) => set({ activeView: view }),

  triggerToast: (message, type = 'success') => {
    set({ toast: { show: true, message, type } });
    setTimeout(() => get().clearToast(), 4000);
  },
  clearToast: () => set({ toast: { show: false, message: '', type: 'success' } }),

  setSearchRadius: (radius) => set({ searchRadius: radius }),
  setSelectedBloodGroup: (bg) => set({ selectedBloodGroup: bg }),

  fetchRequests: async (bloodGroup = '', urgencyLevel = '') => {
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (urgencyLevel) params.urgencyLevel = urgencyLevel;
      
      const res = await api.get('/requests', { params });
      if (res.data.success) {
        set({ requests: res.data.data.requests || [] });
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  },

  createRequest: async (requestData) => {
    try {
      let mappedUrgency = 'Normal';
      const inputUrgency = (requestData.urgencyLevel || '').toLowerCase();
      if (inputUrgency.includes('immediate') || inputUrgency.includes('sos')) {
        mappedUrgency = 'Emergency SOS';
      } else if (inputUrgency.includes('critical')) {
        mappedUrgency = 'Urgent';
      }

      // Backend expects snake_case field names
      const payload = {
        patient_name: requestData.patientName,
        blood_group: requestData.bloodGroup,
        units_required: requestData.unitsRequired,
        hospital_name: requestData.hospitalName,
        hospital_address: requestData.hospitalAddress,
        location: requestData.location,
        city: requestData.city || 'Bengaluru',
        district: requestData.district || 'Bengaluru Urban',
        contact_number: requestData.contactNumber,
        contact_person_name: requestData.contactPersonName,
        required_by_date: requestData.requiredByDate || new Date().toISOString().split('T')[0],
        urgency_level: mappedUrgency,
        additional_notes: requestData.additionalNotes,
      };
      const res = await api.post('/requests', payload);
      if (res.data.success) {
        const newReq = res.data.data.request;
        set((state) => ({ requests: [newReq, ...state.requests] }));
        get().triggerToast('Blood request posted successfully!', 'success');
        return { success: true, request: newReq };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create blood request.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  fulfillRequest: async (requestId) => {
    try {
      const res = await api.patch(`/requests/${requestId}/fulfill`);
      if (res.data.success) {
        const updatedReq = res.data.data.request;
        set((state) => ({
          requests: state.requests.map((r) => String(r._id) === String(requestId) ? updatedReq : r)
        }));
        get().triggerToast('Request marked as fulfilled. Lives saved!', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fulfill request.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  verifyRequest: async (requestId) => {
    try {
      const res = await api.patch(`/requests/${requestId}/verify`);
      if (res.data.success) {
        const updatedReq = res.data.data.request;
        set((state) => ({
          requests: state.requests.map((r) => String(r._id) === String(requestId) ? updatedReq : r)
        }));
        get().triggerToast('Request verified successfully.', 'success');
      }
    } catch (err) {
      get().triggerToast('Failed to verify request.', 'error');
    }
  },

  rejectRequest: async (requestId) => {
    try {
      const res = await api.delete(`/requests/${requestId}`);
      if (res.data.success) {
        set((state) => ({
          requests: state.requests.filter((r) => String(r._id) !== String(requestId))
        }));
        get().triggerToast('Request rejected and removed.', 'warning');
      }
    } catch (err) {
      get().triggerToast('Failed to delete request.', 'error');
    }
  },

  triggerSOS: async (sosData) => {
    try {
      // Backend expects snake_case field names
      const payload = {
        patient_name: sosData.patientName,
        blood_group: sosData.bloodGroup,
        units_required: sosData.unitsRequired,
        hospital_name: sosData.hospitalName,
        city: sosData.city,
        district: sosData.district,
        contact_number: sosData.contactNumber,
        urgency_level: 'Emergency SOS',
        required_by_date: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 10),
      };
      const res = await api.post('/requests', payload);
      if (res.data.success) {
        const newReq = res.data.data.request;
        set((state) => ({ requests: [newReq, ...state.requests] }));
        get().triggerToast('🚨 SOS Emergency Broadcast Active!', 'error');
        return { success: true, request: newReq };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to trigger SOS', err);
      return { success: false };
    }
  },

  startSOSCountdown: (user) => {
    if (get().sosCountdownActive) return;
    if (get().sosTimer) clearInterval(get().sosTimer);

    set({ sosCountdownActive: true, sosCountdown: 3 });

    const timer = setInterval(() => {
      const currentVal = get().sosCountdown;
      if (currentVal <= 1) {
        clearInterval(timer);
        set({ sosCountdownActive: false, sosCountdown: 0, sosTimer: null, sirenPlaying: true });

        const bloodGroup = user ? user.bloodGroup : 'O-';
        const contactNumber = user ? user.mobile || '9999911111' : '9999911111';

        get().triggerSOS({
          patientName: user ? `Emergency: ${user.fullName}` : 'Emergency Case',
          hospitalName: 'General Hospital',
          city: user ? (user.city || 'Bengaluru') : 'Bengaluru',
          district: user ? (user.district || 'Bengaluru Urban') : 'Bengaluru Urban',
          unitsRequired: 2,
          bloodGroup,
          contactNumber,
        });

        // Trigger refetch notifications to pick up the active alert
        setTimeout(() => get().fetchNotifications(), 1000);
      } else {
        set({ sosCountdown: currentVal - 1 });
      }
    }, 1000);

    set({ sosTimer: timer });
  },

  cancelSOS: () => {
    if (get().sosTimer) {
      clearInterval(get().sosTimer);
    }
    set({ sosCountdownActive: false, sosCountdown: 3, sosTimer: null });
  },

  stopSiren: () => set({ sirenPlaying: false }),
  setSirenPlaying: (playing) => set({ sirenPlaying: playing }),

  searchDonors: async (bloodGroup, radius, excludeId) => {
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      
      const res = await api.get('/donors/search', { params });
      if (res.data.success) {
        let donorsList = res.data.data.donors || [];
        // Apply client-side radius filter on simulated/returned distance
        donorsList = donorsList.filter((d) => !radius || d.distance <= radius);
        set({ donors: donorsList });
      }
    } catch (err) {
      console.error('Failed to search donors', err);
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        set({ notifications: res.data.data.notifications || [] });
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  markNotificationRead: async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => String(n._id) === String(id) ? { ...n, read: true } : n)
        }));
      }
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));
        get().triggerToast('All notifications marked as read.', 'success');
      }
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  },

  // Admin Dashboard Actions
  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        set({ allUsers: res.data.data.users || [] });
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  },

  fetchComplaints: async () => {
    try {
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        set({ complaints: res.data.data.complaints || [] });
      }
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status });
      if (res.data.success) {
        set((state) => ({
          allUsers: state.allUsers.map((u) => String(u._id) === String(userId) ? { ...u, status } : u)
        }));
        
        // Sync with authStore if current user was updated
        try {
          const { useAuthStore } = await import('./authStore.js');
          useAuthStore.getState().updateMockUserStatus(userId, status);
        } catch (err) {
          console.error(err);
        }

        get().triggerToast(`User status updated to ${status}.`, 'success');
      }
    } catch (err) {
      get().triggerToast('Failed to update user status.', 'error');
    }
  },

  saveEligibility: async (eligibilityStatus) => {
    try {
      const res = await api.post('/donors/eligibility', { eligibilityStatus });
      if (res.data.success) {
        const updatedUser = res.data.data.user;
        // Sync with authStore
        try {
          const { useAuthStore } = await import('./authStore.js');
          useAuthStore.setState({ user: updatedUser });
          localStorage.setItem('jeevalink_user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error(err);
        }
        get().triggerToast('Donation eligibility questionnaire saved successfully!', 'success');
        return { success: true, user: updatedUser };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save eligibility status.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  updateUserEligibility: async (userId, eligibilityStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/eligibility`, { eligibilityStatus });
      if (res.data.success) {
        set((state) => ({
          allUsers: state.allUsers.map((u) => String(u._id) === String(userId) ? { ...u, eligibilityStatus } : u)
        }));

        // If current user is the one updated, sync with authStore too
        try {
          const { useAuthStore } = await import('./authStore.js');
          const currentUser = useAuthStore.getState().user;
          if (currentUser && String(currentUser._id) === String(userId)) {
            const updatedUser = { ...currentUser, eligibilityStatus };
            useAuthStore.setState({ user: updatedUser });
            localStorage.setItem('jeevalink_user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.error(err);
        }

        get().triggerToast('User eligibility updated successfully.', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      get().triggerToast('Failed to update user eligibility status.', 'error');
      return { success: false };
    }
  },

  fileComplaint: async (complaintData) => {
    try {
      const res = await api.post('/admin/complaints', {
        targetId: complaintData.targetId,
        reason: complaintData.reason
      });
      if (res.data.success) {
        const newComplaint = res.data.data.complaint;
        set((state) => ({ complaints: [newComplaint, ...state.complaints] }));
        get().triggerToast('Report filed successfully. Admin will review.', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to file complaint.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  resolveComplaint: async (complaintId) => {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/resolve`);
      if (res.data.success) {
        set((state) => ({
          complaints: state.complaints.map((c) => String(c._id) === String(complaintId) ? { ...c, status: 'Resolved' } : c)
        }));
        get().triggerToast('Report marked as resolved.', 'success');
      }
    } catch (err) {
      get().triggerToast('Failed to resolve complaint.', 'error');
    }
  },

  suspendUser: async (userId) => {
    await get().updateUserStatus(userId, 'Suspended');
  },

  warnUser: async (userId, message) => {
    try {
      const res = await api.post(`/admin/users/${userId}/warn`, { message });
      if (res.data.success) {
        const user = get().allUsers.find((u) => String(u._id) === String(userId));
        const email = user ? user.email : 'user@example.com';
        get().triggerToast(`Warning message dispatched to ${email}.`, 'warning');
      }
    } catch (err) {
      get().triggerToast('Failed to dispatch warning to user.', 'error');
    }
  },

  deleteUser: async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        set((state) => ({
          allUsers: state.allUsers.filter((u) => String(u._id) !== String(userId))
        }));
        get().triggerToast('User deleted successfully.', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      get().triggerToast('Failed to delete user.', 'error');
      return { success: false };
    }
  },


  addVolunteer: async (volunteerData) => {
    try {
      const payload = {
        full_name: volunteerData.fullName,
        email: volunteerData.email,
        mobile: volunteerData.mobile,
        city: volunteerData.city || 'Kochi',
        district: volunteerData.district || 'Ernakulam'
      };
      const res = await api.post('/admin/volunteers', payload);
      if (res.data.success) {
        const newUser = res.data.data.user;
        set((state) => ({ allUsers: [newUser, ...state.allUsers] }));
        get().triggerToast('Volunteer added successfully!', 'success');
        return { success: true, user: newUser };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add volunteer.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  addUser: (user) => {
    set((state) => {
      // Avoid duplication in allUsers
      if (state.allUsers.some((u) => String(u._id) === String(user._id))) {
        return {};
      }
      const newUser = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || 'donor',
        bloodGroup: user.bloodGroup || 'N/A',
        district: user.district || 'Bengaluru Urban',
        status: user.status || 'Active',
        joinedAt: user.joinedAt || new Date().toISOString().split('T')[0]
      };
      
      const updatedUsers = [...state.allUsers, newUser];
      let updatedDonors = state.donors;
      
      if (newUser.role === 'donor') {
        const newDonor = {
          _id: user._id,
          fullName: user.fullName,
          bloodGroup: user.bloodGroup,
          city: user.city || 'Bengaluru',
          district: user.district || 'Bengaluru Urban',
          distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
          availableForDonation: user.availableForDonation !== undefined ? user.availableForDonation : true,
          totalDonations: user.totalDonations || 0,
          compatibilityScore: 100,
          matchScore: 100,
          mobile: user.mobile,
          lastDonated: user.lastDonated || null
        };
        updatedDonors = [newDonor, ...state.donors];
      }
      
      return {
        allUsers: updatedUsers,
        donors: updatedDonors
      };
    });
  },

  updateUserInLists: (userId, updates) => {
    set((state) => ({
      allUsers: state.allUsers.map((u) => String(u._id) === String(userId) ? { ...u, ...updates } : u),
      donors: state.donors.map((d) => String(d._id) === String(userId) ? { ...d, ...updates } : d),
    }));
  },

  fetchEmergencyRequests: async (filters = {}) => {
    try {
      const res = await api.get('/emergency/history', { params: filters });
      if (res.data.success) {
        set({ emergencyRequests: res.data.data.requests || [] });
      }
    } catch (err) {
      console.error('Failed to fetch emergency requests', err);
    }
  },

  createEmergencyRequest: async (data) => {
    try {
      const res = await api.post('/emergency/request', data);
      if (res.data.success) {
        const newReq = res.data.data.request;
        set((state) => ({ 
          emergencyRequests: [newReq, ...state.emergencyRequests] 
        }));
        get().triggerToast('Emergency alert broadcasted successfully!', 'success');
        return { success: true, request: newReq };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to trigger emergency request.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  fetchEmergencyDetails: async (id) => {
    try {
      const res = await api.get(`/emergency/details/${id}`);
      if (res.data.success) {
        set({ emergencyDetails: res.data.data || null });
        return { success: true, data: res.data.data };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to fetch emergency details', err);
      return { success: false };
    }
  },

  acceptEmergencyRequest: async (requestId) => {
    try {
      const res = await api.post('/emergency/accept', { request_id: requestId });
      if (res.data.success) {
        get().triggerToast(res.data.message || 'Alert accepted successfully!', 'success');
        // Refresh details if open
        const currentDetails = get().emergencyDetails;
        if (currentDetails && String(currentDetails.request.id) === String(requestId)) {
          get().fetchEmergencyDetails(requestId);
        }
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to accept request.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  rejectEmergencyRequest: async (requestId) => {
    try {
      const res = await api.post('/emergency/reject', { request_id: requestId });
      if (res.data.success) {
        get().triggerToast('Alert rejected.', 'warning');
        const currentDetails = get().emergencyDetails;
        if (currentDetails && String(currentDetails.request.id) === String(requestId)) {
          get().fetchEmergencyDetails(requestId);
        }
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  },

  fetchNearbyDonors: async (params) => {
    try {
      const res = await api.get('/emergency/nearby-donors', { params });
      if (res.data.success) {
        set({ nearbyDonors: res.data.data.donors || [] });
      }
    } catch (err) {
      console.error('Failed to fetch nearby donors', err);
    }
  },

  fetchLiveDonorCount: async (params = {}) => {
    try {
      const res = await api.get('/emergency/live-donor-count', { params });
      if (res.data.success) {
        set({ liveDonorCount: res.data.data.count || 0 });
      }
    } catch (err) {
      console.error('Failed to fetch live donor count', err);
    }
  },

  saveFcmToken: async (fcmToken, latitude = null, longitude = null, notificationEnabled = true) => {
    try {
      const res = await api.post('/save-fcm-token', {
        fcm_token: fcmToken,
        latitude,
        longitude,
        notification_enabled: notificationEnabled
      });
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('Failed to save FCM token', err);
      return { success: false };
    }
  },

  fetchPartners: async () => {
    try {
      const res = await api.get('/partners');
      if (res.data.success) {
        set({ partners: res.data.data.partners || [] });
      }
    } catch (err) {
      console.error('Failed to fetch partners', err);
    }
  },

  addPartner: async (payload) => {
    try {
      const res = await api.post('/admin/partners', payload);
      if (res.data.success) {
        const newPartner = res.data.data.partner;
        set((state) => ({ partners: [newPartner, ...state.partners] }));
        get().triggerToast('Partner added successfully!', 'success');
        return { success: true, partner: newPartner };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add partner.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  updatePartner: async (id, payload) => {
    try {
      const res = await api.post(`/admin/partners/${id}`, payload);
      if (res.data.success) {
        const updated = res.data.data.partner;
        set((state) => ({
          partners: state.partners.map(p => p._id === id ? updated : p)
        }));
        get().triggerToast('Partner updated successfully!', 'success');
        return { success: true, partner: updated };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update partner.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  deletePartner: async (id) => {
    try {
      const res = await api.delete(`/admin/partners/${id}`);
      if (res.data.success) {
        set((state) => ({
          partners: state.partners.filter(p => p._id !== id)
        }));
        get().triggerToast('Partner deleted successfully!', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete partner.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  volunteerSendOtp: async (userId) => {
    try {
      const res = await api.post(`/volunteer/users/${userId}/send-otp`);
      if (res.data.success) {
        get().triggerToast('OTP sent to user email successfully.', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send OTP.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  volunteerVerifyOtp: async (userId, otp) => {
    try {
      const res = await api.post(`/volunteer/users/${userId}/verify-otp`, { otp });
      if (res.data.success) {
        get().triggerToast('OTP verified successfully.', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired OTP.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  volunteerUpdateUser: async (userId, data) => {
    try {
      const res = await api.patch(`/volunteer/users/${userId}`, data);
      if (res.data.success) {
        const updatedUser = res.data.data.user;
        set((state) => ({
          allUsers: state.allUsers.map((u) => String(u._id) === String(userId) ? { ...u, ...updatedUser } : u)
        }));
        get().triggerToast('User details updated successfully!', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update user.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },

  volunteerAddUser: async (data) => {
    try {
      const res = await api.post('/volunteer/users', data);
      if (res.data.success) {
        set((state) => ({
          allUsers: [...state.allUsers, res.data.data.user]
        }));
        get().triggerToast(res.data.message || 'User added successfully!', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add user.';
      get().triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  },
}));
