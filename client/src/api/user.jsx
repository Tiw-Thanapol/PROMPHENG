import axios from "axios";

export const createUserCart = async (token, cart) => {
  // code body
  return axios.post("http://localhost:5000/api/user/cart", cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const listUserCart = async (token) => {
  // code body
  return axios.get("http://localhost:5000/api/user/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveAddress = async (token, address) => {
  //console.log('Sending request with token:', token); // Debug token
  return axios.post('http://localhost:5000/api/user/address',
    { address }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const userProfile = async (token, userData) => {
  try {
    // ส่งข้อมูลทั้งหมดที่ต้องการอัพเดต
    const response = await axios.put('http://localhost:5000/api/user/profile', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
export const saveOrder = async (token, payload) => {
  //console.log('Sending request with token:', token); // Debug token
  return axios.post('http://localhost:5000/api/user/order',
    payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const getOrders = async (token) => {
  //console.log('Sending request with token:', token); // Debug token
  return axios.get('http://localhost:5000/api/user/order',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
};