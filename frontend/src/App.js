import React, { useState, useEffect } from 'react';
import * as api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [deliveryModal, setDeliveryModal] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [submittedDelivery, setSubmittedDelivery] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setView('products');
    }
  }, []);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data } = await api.getProducts();
      setProducts(data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error loading products');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const authData = { ...formData, isAdmin: selectedRole === 'admin' ? 'true' : 'false' };
      const { data } = view === 'login' 
        ? await api.login(formData) 
        : await api.register(authData);
      
      if (view === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setView('products');
      } else {
        setMessage('Registration successful! Please login.');
        setView('login');
        setSelectedRole(null);
      }
      setFormData({});
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('login');
    setSelectedRole(null);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct(formData);
      setFormData({});
      loadProducts();
    } catch (error) {
      if (user.isAdmin) {
        setMessage(error.response?.data?.error || 'Error creating product');
      }
    }
  };

  const handleBid = async (productId, amount) => {
    try {
      await api.placeBid({ productId, amount: parseFloat(amount) });
      loadProducts();
    } catch (error) {
      if (!user.isAdmin) {
        setMessage(error.response?.data?.error || 'Error placing bid');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (error) {
      if (user.isAdmin) {
        setMessage(error.response?.data?.error || 'Error deleting product');
      }
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting delivery:', { ...formData, productId: deliveryModal });
      const response = await api.submitDelivery({ ...formData, productId: deliveryModal });
      console.log('Response:', response);
      setSubmittedDelivery({...submittedDelivery, [deliveryModal]: true});
      setDeliveryModal(null);
      setFormData({});
      loadProducts();
    } catch (error) {
      console.error('Delivery error:', error);
      console.error('Error response:', error.response);
      setMessage(error.response?.data?.error || error.message || 'Error submitting details');
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await api.getAdminOrders();
      setOrders(data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error loading orders');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating status');
    }
  };

  const getTimeRemaining = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (!user) {
    if (!selectedRole) {
      return (
        <div className="role-selection">
          <div className="role-container">
            <h1>Welcome to Online Auction</h1>
            <p>Select your role to continue</p>
            <div className="role-boxes">
              <div className="role-box" onClick={() => setSelectedRole('admin')}>
                <div className="role-icon">👨‍💼</div>
                <h2>Admin</h2>
                <p>Manage auctions and products</p>
              </div>
              <div className="role-box" onClick={() => setSelectedRole('user')}>
                <div className="role-icon">👤</div>
                <h2>User</h2>
                <p>Browse and bid on products</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-page">
        <button className="back-btn" onClick={() => setSelectedRole(null)}>← Back</button>
        <div className="auth-form">
          <h2>{selectedRole === 'admin' ? '👨‍💼 Admin' : '👤 User'} {view === 'login' ? 'Login' : 'Register'}</h2>
          {message && <p className="error">{message}</p>}
          <form onSubmit={handleAuth}>
            {view === 'register' && (
              <input
                placeholder="Username"
                value={formData.username || ''}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password || ''}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="submit">{view === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <p className="toggle-view">
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => {setView(view === 'login' ? 'register' : 'login'); setMessage('')}}>
              {view === 'login' ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="navbar">
        <h2>Online Auction</h2>
        <div>
          <span>Welcome, {user.username} {user.isAdmin && '(Admin)'}</span>
          {user.isAdmin && (
            <button onClick={() => { setShowOrders(!showOrders); if (!showOrders) loadOrders(); }} style={{background: '#667eea', marginLeft: '10px'}}>
              {showOrders ? 'View Products' : 'View Orders'}
            </button>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="container">
        {message && !user.isAdmin && <p className={message.includes('success') ? 'success' : 'error'}>{message}</p>}
        
        {showOrders && user.isAdmin ? (
          <div className="orders-section">
            <h2>Winner Details & Orders</h2>
            {orders.length === 0 ? (
              <p style={{color: '#888', textAlign: 'center', marginTop: '30px'}}>No orders yet</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <h3>{order.product?.name || 'Product Deleted'}</h3>
                    <div className="order-details">
                      <p><strong>Winner:</strong> {order.winner?.username}</p>
                      <p><strong>Winning Bid:</strong> ${order.winningBid}</p>
                      <p><strong>Full Name:</strong> {order.fullName}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                    </div>
                    <div className="status-buttons">
                      <button onClick={() => handleStatusUpdate(order._id, 'Pending')} disabled={order.status === 'Pending'}>Pending</button>
                      <button onClick={() => handleStatusUpdate(order._id, 'Dispatched')} disabled={order.status === 'Dispatched'}>Dispatched</button>
                      <button onClick={() => handleStatusUpdate(order._id, 'Delivered')} disabled={order.status === 'Delivered'}>Delivered</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {user.isAdmin && (
              <div className="admin-form">
                <h3>Add New Product</h3>
                <form onSubmit={handleCreateProduct}>
                  <input
                    placeholder="Product Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                  <input
                    placeholder="Image URL (optional)"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Starting Price"
                    value={formData.startingPrice || ''}
                    onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                  <button type="submit">Add Product</button>
                </form>
              </div>
            )}

            <div className="products-grid">
              {products.map((product) => {
                const timeRemaining = getTimeRemaining(product.endTime);
                const isEnded = timeRemaining === 'Ended';
                const highestBidderId = product.highestBidder?._id || product.highestBidder;
                const isWinner = !user.isAdmin && isEnded && highestBidderId && (highestBidderId === user.id || highestBidderId === user._id);
                
                return (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerHTML='<div style="color:#666;font-size:1rem;">Image not available</div>';}} />
                      ) : (
                        <div style={{color:'#666',fontSize:'1rem'}}>No Image</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p className={expandedDesc[product._id] ? "product-description expanded" : "product-description"}>
                        {product.description}
                      </p>
                      {product.description.length > 100 && (
                        <span 
                          className="read-more" 
                          onClick={() => setExpandedDesc({...expandedDesc, [product._id]: !expandedDesc[product._id]})}
                        >
                          {expandedDesc[product._id] ? 'Show less' : 'Read more'}
                        </span>
                      )}
                      <p><strong>Current Bid:</strong> ${product.currentBid}</p>
                      <p><strong>Highest Bidder:</strong> {product.highestBidder?.username || 'None'}</p>
                      <p><strong>Time Remaining:</strong> {timeRemaining}</p>
                      
                      <div className="product-actions">
                    
                      {isEnded && product.highestBidder && (
                        <p className="winner-badge">🏆 Winner: {product.highestBidder.username}</p>
                      )}
                      
                      {isWinner && !submittedDelivery[product._id] && (
                        <button onClick={() => setDeliveryModal(product._id)} style={{background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)'}}>
                          Submit Delivery Details
                        </button>
                      )}
                      
                      {isWinner && submittedDelivery[product._id] && (
                        <p style={{color: '#51cf66', fontWeight: '600', textAlign: 'center', padding: '10px'}}>✅ Delivery details submitted</p>
                      )}
                      
                      {!user.isAdmin && !isEnded && (
                        <>
                          <input
                            type="number"
                            placeholder="Enter bid amount"
                            id={`bid-${product._id}`}
                          />
                          <button onClick={() => {
                            const amount = document.getElementById(`bid-${product._id}`).value;
                            handleBid(product._id, amount);
                          }}>
                            Place Bid
                          </button>
                        </>
                      )}
                      
                      {user.isAdmin && (
                        <button className="delete" onClick={() => handleDelete(product._id)}>
                          Delete Auction
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {deliveryModal && (
        <div className="modal-overlay" onClick={() => setDeliveryModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delivery Details</h2>
            <form onSubmit={handleDeliverySubmit}>
              <input
                placeholder="Full Name"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
              <input
                placeholder="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <textarea
                placeholder="Complete Address"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows="4"
                required
              />
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setDeliveryModal(null)} style={{background: '#ff6b6b'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
