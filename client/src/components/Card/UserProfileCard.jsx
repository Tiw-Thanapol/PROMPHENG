import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useEcomStore from '../../store/ecom-store';

const UserProfileCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const logout = useEcomStore(state => state.logout)
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });

  // ดึงข้อมูลผู้ใช้เมื่อโหลดหน้าโปรไฟล์
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile');
        setUser(res.data);
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }
    };

    fetchUserData();
  }, []);

  // จัดการกับการเปลี่ยนแปลงของข้อมูลที่ผู้ใช้กรอก
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setUser((prevUser) => ({
        ...prevUser,
        address: {
          ...prevUser.address,
          [field]: value,
        },
      }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  // บันทึกการเปลี่ยนแปลงข้อมูลผู้ใช้
  const handleSave = async () => {
    try {
      await axios.put('http://localhost:5000/api/user/profile', user);
      toast.success('บันทึกข้อมูลสำเร็จ');
      setIsEditing(false);
    } catch (error) {
      toast.error('การบันทึกล้มเหลว');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src="https://via.placeholder.com/150"
            alt="User Profile"
            className="w-32 h-32 rounded-full shadow-md mb-4"
          />
          <h1 className="text-2xl font-semibold text-gray-700 mb-1">{user.name || 'User Name'}</h1>
          <p className="text-gray-500 mb-4">User Profile</p>

          <div className="w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={!isEditing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={!isEditing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Phone</label>
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={!isEditing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Address</label>
              <input
                type="text"
                name="address.street"
                value={user.address.street}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={!isEditing}
              />
              <input
                type="text"
                name="address.city"
                value={user.address.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md mt-2"
                disabled={!isEditing}
              />
              <input
                type="text"
                name="address.postalCode"
                value={user.address.postalCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md mt-2"
                disabled={!isEditing}
              />
              <input
                type="text"
                name="address.country"
                value={user.address.country}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md mt-2"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button
                  className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white font-semibold py-2 px-4 
                rounded-md mt-4 hover:bg-blue-600 transition duration-200"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>

            )}
            <button
              onClick={() => {
                logout();  // เรียกใช้งาน logout จาก store
              }}
              className="bg-blue-500 text-white font-semibold py-2 px-4 
                rounded-md mt-4 hover:bg-blue-600 transition duration-200">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
