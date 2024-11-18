import axios from 'axios'

export const getOrdersAdmin = async (token) => {
  //console.log('Sending request with token:', token); // Debug token
  return axios.get('http://localhost:5000/api/admin/orders',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
};
export const changeOrderStatus = async (token, orderId, orderStatus) => {
  //console.log('Sending request with token:', token); // Debug token
  return axios.put('http://localhost:5000/api/admin/order-status',
    {
      orderId, orderStatus,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
  export const getListAllUsers = async (token) => {
    //console.log('Sending request with token:', token); // Debug token
    return axios.get('http://localhost:5000/api/users',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  };
  export const changeUserStatus = async (token, value) => {
    //console.log('Sending request with token:', token); // Debug token
    return axios.post('http://localhost:5000/api/change-status',value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  };
  export const changeUserRole = async (token, value) => {
    //console.log('Sending request with token:', token); // Debug token
    return axios.post('http://localhost:5000/api/change-role',value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  };