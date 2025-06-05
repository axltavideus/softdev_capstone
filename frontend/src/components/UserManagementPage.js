import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementPage.css';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openModalForCreate = () => {
    setEditingUserId(null);
    setFormData({ username: '', email: '', password: '', isAdmin: false });
    setError('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      isAdmin: user.isAdmin,
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({ username: '', email: '', password: '', isAdmin: false });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (editingUserId) {
        // Update user
        await axios.put(`http://localhost:5000/api/users/${editingUserId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Create user
        await axios.post('http://localhost:5000/api/users', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="user-management-page">
      <h2>User Management</h2>
      <button className="open-modal-button" onClick={openModalForCreate}>Create New User</button>
      {error && <div className="error-message">{error}</div>}

      {isModalOpen && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUserId ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="user-form">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={editingUserId ? "New Password (leave blank to keep current)" : "Password"}
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUserId}
              />
              <label>
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                />
                Admin
              </label>
              <div className="modal-buttons">
                <button type="submit">{editingUserId ? 'Update User' : 'Create User'}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td data-label="ID">{user.id}</td>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Admin">{user.isAdmin ? 'Yes' : 'No'}</td>
                <td data-label="Actions">
                  <button onClick={() => openModalForEdit(user)}>Edit</button>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserManagementPage;
