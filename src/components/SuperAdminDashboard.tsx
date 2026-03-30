import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Search, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  X
} from 'lucide-react';
import { 
  Team, 
  UserProfile, 
  Subscription, 
  UserRole 
} from '../types';
import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  where
} from '../firebase';

export default function SuperAdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'teams' | 'users' | 'subscriptions'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', ownerEmail: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const teamsSnap = await getDocs(collection(db, 'teams'));
      const usersSnap = await getDocs(collection(db, 'user_profiles'));
      const subsSnap = await getDocs(collection(db, 'subscriptions'));

      setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      setUserProfiles(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setSubscriptions(subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription)));
    } catch (error) {
      console.error("Error fetching superadmin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find user by email
      const user = userProfiles.find(u => u.email.toLowerCase() === newCompany.ownerEmail.toLowerCase());
      if (!user) {
        alert("User with this email not found. Please ensure the user has signed up first.");
        return;
      }

      const teamData = {
        name: newCompany.name,
        ownerId: user.uid,
        memberRoles: { [user.uid]: UserRole.ADMIN },
        members: [{ uid: user.uid, email: user.email, role: UserRole.ADMIN, joinedAt: Date.now() }],
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'teams'), teamData);
      setShowAddCompany(false);
      setNewCompany({ name: '', ownerEmail: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };

  const handleUpdateUserStatus = async (uid: string, status: 'active' | 'inactive') => {
    try {
      await updateDoc(doc(db, 'user_profiles', uid), { status, updatedAt: Date.now() });
      setUserProfiles(prev => prev.map(u => u.uid === uid ? { ...u, status, updatedAt: Date.now() } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleUpdateSubscription = async (teamId: string, plan: 'free' | 'pro' | 'enterprise') => {
    try {
      const existingSub = subscriptions.find(s => s.teamId === teamId);
      const subData = {
        teamId,
        plan,
        status: 'active' as const,
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        price: plan === 'pro' ? 29 : plan === 'enterprise' ? 99 : 0,
        currency: 'USD',
        billingCycle: 'monthly' as const,
        updatedAt: Date.now()
      };

      if (existingSub) {
        await updateDoc(doc(db, 'subscriptions', existingSub.id), subData);
      } else {
        const newDoc = await addDoc(collection(db, 'subscriptions'), { ...subData, createdAt: Date.now() });
        // Update team with subscriptionId
        await updateDoc(doc(db, 'teams', teamId), { subscriptionId: newDoc.id });
      }
      fetchData();
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = userProfiles.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Superadmin Control Panel</h2>
          <p className="text-slate-500 text-sm">Manage all companies, users, and subscriptions globally.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setShowAddCompany(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button
            onClick={() => setActiveView('teams')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'teams' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 inline-block mr-2" />
            Companies
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveView('subscriptions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'subscriptions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4 inline-block mr-2" />
            Subscriptions
          </button>
        </div>
      </div>

      {showAddCompany && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Add New Company</h3>
              <button 
                onClick={() => setShowAddCompany(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={newCompany.ownerEmail}
                  onChange={(e) => setNewCompany({ ...newCompany, ownerEmail: e.target.value })}
                  placeholder="owner@example.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="mt-1 text-xs text-slate-500 italic">The user must have already signed up for the app.</p>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeView === 'teams' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team) => {
                  const sub = subscriptions.find(s => s.teamId === team.id);
                  return (
                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{team.name}</div>
                        <div className="text-xs text-slate-500">ID: {team.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {userProfiles.find(u => u.uid === team.ownerId)?.email || team.ownerId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {team.members.length} members
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                          sub?.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {sub?.plan?.toUpperCase() || 'NO PLAN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeView === 'users' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {user.displayName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.displayName || 'Unnamed User'}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === UserRole.SUPERADMIN ? 'bg-red-100 text-red-700' :
                        user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleUpdateUserStatus(user.uid, 'inactive')}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="Deactivate User"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateUserStatus(user.uid, 'active')}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Activate User"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeView === 'subscriptions' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Plan</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Change Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => {
                  const sub = subscriptions.find(s => s.teamId === team.id);
                  return (
                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{team.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                          sub?.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {sub?.plan?.toUpperCase() || 'FREE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {sub?.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {sub ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={sub?.plan || 'free'}
                          onChange={(e) => handleUpdateSubscription(team.id, e.target.value as any)}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
