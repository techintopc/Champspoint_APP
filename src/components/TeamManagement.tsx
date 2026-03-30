import React from 'react';
import { Team, UserRole, TeamMember } from '../types';
import { Users, UserPlus, Shield, Mail, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface TeamManagementProps {
  team: Team | null;
  onUpdateTeam: (data: Partial<Team>) => Promise<void>;
  onInviteMember: (email: string, role: UserRole) => Promise<void>;
  onRemoveMember: (uid: string) => Promise<void>;
}

export default function TeamManagement({ team, onUpdateTeam, onInviteMember, onRemoveMember }: TeamManagementProps) {
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<UserRole>(UserRole.VIEWER);
  const [isInviting, setIsInviting] = React.useState(false);

  if (!team) return <div className="p-8 text-center text-slate-500">Loading team...</div>;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole(UserRole.VIEWER);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
          <p className="text-slate-500">Manage your team members and their access roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                Team Members
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {team.members.length} Members
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {team.members.map((member) => (
                <div key={member.uid} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{member.email}</p>
                      <p className="text-xs text-slate-500">Joined {format(member.joinedAt, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                      <Shield size={14} />
                      <span className="capitalize">{member.role}</span>
                    </div>
                    {team.ownerId !== member.uid && (
                      <button 
                        onClick={() => onRemoveMember(member.uid)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              Invite Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Access Role</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.VIEWER}>Viewer (Read Only)</option>
                  <option value={UserRole.EDITOR}>Editor (Can Create/Edit)</option>
                  <option value={UserRole.ADMIN}>Admin (Full Access)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="w-full py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Role Permissions</h4>
              <ul className="text-xs space-y-2 text-indigo-100">
                <li>• <strong className="text-white">Admin:</strong> Full control over team, billing, and settings.</li>
                <li>• <strong className="text-white">Editor:</strong> Can manage invoices, expenses, and clients.</li>
                <li>• <strong className="text-white">Viewer:</strong> Can only view data and reports.</li>
              </ul>
            </div>
            <Users className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}
