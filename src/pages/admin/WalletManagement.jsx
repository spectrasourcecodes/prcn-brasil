import { useState, useEffect } from 'react';
import { FaSearch, FaWallet, FaSave, FaTimes, FaSpinner, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../utils/axios';

const WalletManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Form state for wallet fields – directly editable values
  const [walletForm, setWalletForm] = useState({
    balance: '',
    profitBalance: '',
    referralBalance: '',
    totalDeposits: '',
    totalWithdrawals: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleViewWallet = async (userId) => {
    try {
      const userFromList = users.find(u => u._id === userId);
      if (!userFromList) {
        toast.error('User not found');
        return;
      }

      setSelectedUser({
        _id: userFromList._id,
        fullName: userFromList.fullName || userFromList.name || 'Unknown',
        email: userFromList.email || '',
        currency: userFromList.currency || 'USD',
        isActive: userFromList.isActive !== undefined ? userFromList.isActive : true,
      });

      // Fetch wallet
      try {
        const walletResponse = await API.get(`/admin/users/${userId}/wallet`);
        const data = walletResponse.data.data;
        setWalletData(data);
        // Populate form with current values
        setWalletForm({
          balance: data.balance ?? '',
          profitBalance: data.profitBalance ?? '',
          referralBalance: data.referralBalance ?? '',
          totalDeposits: data.totalDeposits ?? '',
          totalWithdrawals: data.totalWithdrawals ?? '',
        });
        setShowWalletModal(true);
      } catch (e) {
        if (e.response?.status === 404) {
          // Wallet doesn't exist – create it
          toast.loading('Creating wallet...');
          try {
            const createResponse = await API.post(`/admin/users/${userId}/wallet`, {});
            const newWallet = createResponse.data.data;
            setWalletData(newWallet);
            setWalletForm({
              balance: newWallet.balance ?? '',
              profitBalance: newWallet.profitBalance ?? '',
              referralBalance: newWallet.referralBalance ?? '',
              totalDeposits: newWallet.totalDeposits ?? '',
              totalWithdrawals: newWallet.totalWithdrawals ?? '',
            });
            toast.dismiss();
            toast.success('Wallet created successfully');
            setShowWalletModal(true);
          } catch (err) {
            toast.dismiss();
            toast.error('Failed to create wallet');
          }
        } else {
          toast.error('Failed to fetch wallet');
        }
      }
    } catch (error) {
      console.error('View wallet error:', error);
      toast.error('Failed to load user wallet');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setWalletForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateWallet = async () => {
    if (!selectedUser || !selectedUser._id) {
      toast.error('No user selected');
      return;
    }

    // Build update object – only send fields that have a value
    const updateData = {};
    if (walletForm.balance !== '') updateData.balance = parseFloat(walletForm.balance);
    if (walletForm.profitBalance !== '') updateData.profitBalance = parseFloat(walletForm.profitBalance);
    if (walletForm.referralBalance !== '') updateData.referralBalance = parseFloat(walletForm.referralBalance);
    if (walletForm.totalDeposits !== '') updateData.totalDeposits = parseFloat(walletForm.totalDeposits);
    if (walletForm.totalWithdrawals !== '') updateData.totalWithdrawals = parseFloat(walletForm.totalWithdrawals);

    // Validate at least one field is provided
    if (Object.keys(updateData).length === 0) {
      toast.error('Please enter at least one value to update');
      return;
    }

    setUpdating(true);
    try {
      const response = await API.put(`/admin/users/${selectedUser._id}/wallet`, updateData);
      if (response.data.success) {
        toast.success('Wallet updated successfully');
        // Refresh wallet data
        const walletResponse = await API.get(`/admin/users/${selectedUser._id}/wallet`);
        const newData = walletResponse.data.data;
        setWalletData(newData);
        // Update form with new values
        setWalletForm({
          balance: newData.balance ?? '',
          profitBalance: newData.profitBalance ?? '',
          referralBalance: newData.referralBalance ?? '',
          totalDeposits: newData.totalDeposits ?? '',
          totalWithdrawals: newData.totalWithdrawals ?? '',
        });
        // Update user list with new wallet data
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  balance: newData.balance,
                  profitBalance: newData.profitBalance,
                  referralBalance: newData.referralBalance,
                }
              : user
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update wallet');
      }
    } catch (error) {
      console.error('Update wallet error:', error);
      toast.error(error.response?.data?.message || 'Failed to update wallet');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    return status ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10';
  };

  const getStatusText = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
        <p className="text-slate-400 mt-1">Manage user wallets and balances</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{user.fullName || user.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {getStatusText(user.isActive)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewWallet(user._id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition"
                          title="Manage Wallet"
                        >
                          <FaWallet className="text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {users.length} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 bg-slate-700 rounded-lg text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {showWalletModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Wallet Management</h2>
                <p className="text-sm text-slate-400">{selectedUser.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">ID: {selectedUser._id}</p>
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setSelectedUser(null);
                  setWalletData(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <FaTimes className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Wallet Overview (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${(walletData?.balance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Profit Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${(walletData?.profitBalance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-400">Referral Balance</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    ${(walletData?.referralBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Update Wallet Form – Direct Input */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Update Wallet Fields (Direct Input)</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Enter the new values for the fields you want to update. Leave blank to keep the current value.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Balance</label>
                    <input
                      type="number"
                      name="balance"
                      value={walletForm.balance}
                      onChange={handleFormChange}
                      placeholder="Current: 0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Profit Balance</label>
                    <input
                      type="number"
                      name="profitBalance"
                      value={walletForm.profitBalance}
                      onChange={handleFormChange}
                      placeholder="Current: 0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Referral Balance</label>
                    <input
                      type="number"
                      name="referralBalance"
                      value={walletForm.referralBalance}
                      onChange={handleFormChange}
                      placeholder="Current: 0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total Deposits</label>
                    <input
                      type="number"
                      name="totalDeposits"
                      value={walletForm.totalDeposits}
                      onChange={handleFormChange}
                      placeholder="Current: 0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Total Withdrawals</label>
                    <input
                      type="number"
                      name="totalWithdrawals"
                      value={walletForm.totalWithdrawals}
                      onChange={handleFormChange}
                      placeholder="Current: 0.00"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdateWallet}
                disabled={updating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {updating ? 'Updating...' : 'Save Wallet Changes'}
              </button>

              {/* Wallet Details */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Wallet Details (Read-only)</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Total Deposits (recorded):</span>
                    <span className="text-white ml-2">${(walletData?.totalDeposits || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Withdrawals (recorded):</span>
                    <span className="text-white ml-2">${(walletData?.totalWithdrawals || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">User ID:</span>
                    <span className="text-white ml-2 text-xs">{selectedUser._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Currency:</span>
                    <span className="text-white ml-2">{selectedUser.currency || 'USD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;