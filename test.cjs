const axios = require('axios');

// Set API_BASE_URL environment variable before running:
// $env:API_BASE_URL = "https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/v1"; node test.cjs
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
console.log(`Testing against: ${API_BASE}`);

const payload = {
  full_name: "Test User",
  email: "test55@test.com",
  mobile: "1234567895",
  password: "password123",
  role: "donor",
  city: "City",
  district: "District"
};
axios.post(`${API_BASE}/auth/register`, payload)
  .then(res => console.log("Success:", res.data))
  .catch(err => {
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  });
