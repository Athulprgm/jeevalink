const axios = require('axios');
const payload = {
  full_name: "Test User",
  email: "test55@test.com",
  mobile: "1234567895",
  password: "password123",
  role: "donor",
  city: "City",
  district: "District"
};
axios.post('https://mindful-exploration-production-8f55.up.railway.app/api/v1/auth/register', payload)
  .then(res => console.log("Success:", res.data))
  .catch(err => {
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  });
