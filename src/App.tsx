/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Application Error</h2>
            <p className="text-slate-600 text-center mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
import { 
  Invoice, 
  Expense, 
  Client, 
  CompanyProfile, 
  InvoiceStatus,
  Lead,
  LeadStatus,
  Team,
  UserRole,
  AuditLog,
  UserProfile
} from './types';
import { 
  auth, 
  db, 
  logout, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateProfile,
  updatePassword
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { limit } from 'firebase/firestore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import Settings from './components/Settings';
import Auth from './components/Auth';
import AuditLogs from './components/AuditLogs';
import TeamManagement from './components/TeamManagement';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { generateInvoicePDF } from './lib/pdf';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    name: 'Champspoint IT Solutions',
    email: '',
    address: '123 Tech Avenue, Silicon Valley, CA',
    phone: '+1 (555) 123-4567',
    website: 'https://champspoint.com',
    currency: 'USD',
    defaultTaxRate: 0,
    invoicePrefix: 'INV',
    whatsappEnabled: true,
    whatsappMessageTemplate: 'Hello {clientName}, here is your invoice {invoiceNumber} from {companyName}. Total: {total}. Due: {dueDate}.',
    notifications: {
      emailInvoices: true,
      whatsappInvoices: true,
      paymentReminders: true,
      newLeadAlerts: true
    },
    billing: {
      plan: 'free',
      status: 'active',
      currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 60
    }
  });

  // UI state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  const logAction = async (action: string, entityType: AuditLog['entityType'], entityId?: string, details?: string) => {
    if (!user || !team) return;
    try {
      await addDoc(collection(db, 'audit_logs'), {
        teamId: team.id,
        userId: user.uid,
        userEmail: user.email,
        action,
        entityType,
        entityId,
        details: details || '',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setProfile(prev => ({ ...prev, email: user.email || '' }));
        
        const superAdminEmail = 'maaan.admiin@gmail.com';
        const isSA = user.email === superAdminEmail;
        setIsSuperAdmin(isSA);

        // Initialize/Fetch User Profile
        const profileRef = doc(db, 'user_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || undefined,
            role: isSA ? UserRole.SUPERADMIN : UserRole.ADMIN,
            status: isSA ? 'active' : 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          await setDoc(profileRef, newProfile);
          setUserProfile(newProfile);
        } else {
          setUserProfile(profileSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Team and Profile
  useEffect(() => {
    if (!user) return;

    const initTeam = async () => {
      // Find teams where user is owner or member
      const qOwner = query(collection(db, 'teams'), where('ownerId', '==', user.uid));
      const unsubTeam = onSnapshot(qOwner, async (snapshot) => {
        if (snapshot.empty) {
          // If not owner, check if member
          const qMember = query(collection(db, 'teams'), where(`memberRoles.${user.uid}`, 'in', [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]));
          const memberSnap = await getDocs(qMember);
          
          if (memberSnap.empty) {
            // Create default team if none exists
            const newTeamRef = await addDoc(collection(db, 'teams'), {
              name: `${user.email?.split('@')[0]}'s Team`,
              ownerId: user.uid,
              memberRoles: { [user.uid]: UserRole.ADMIN },
              members: [{ uid: user.uid, email: user.email, role: UserRole.ADMIN, joinedAt: Date.now() }],
              createdAt: Date.now()
            });
            const newTeamSnap = await getDoc(newTeamRef);
            setTeam({ id: newTeamSnap.id, ...newTeamSnap.data() } as Team);
          } else {
            setTeam({ id: memberSnap.docs[0].id, ...memberSnap.docs[0].data() } as Team);
          }
        } else {
          setTeam({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Team);
        }
      });

      const unsubProfile = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as CompanyProfile);
        }
      });

      return () => {
        unsubTeam();
        unsubProfile();
      };
    };

    initTeam();
  }, [user]);

  // Fetch Data scoped by Team
  useEffect(() => {
    if (!user || !team) return;

    const qInvoices = query(collection(db, 'invoices'), where('teamId', '==', team.id), orderBy('createdAt', 'desc'));
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    });

    const qExpenses = query(collection(db, 'expenses'), where('teamId', '==', team.id), orderBy('createdAt', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });

    const qClients = query(collection(db, 'clients'), where('teamId', '==', team.id), orderBy('createdAt', 'desc'));
    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    const qLeads = query(collection(db, 'leads'), where('teamId', '==', team.id), orderBy('createdAt', 'desc'));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    });

    const qLogs = query(collection(db, 'audit_logs'), where('teamId', '==', team.id), orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setAuditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
    });

    return () => {
      unsubInvoices();
      unsubExpenses();
      unsubClients();
      unsubLeads();
      unsubLogs();
    };
  }, [user, team]);

  // Handlers
  const handleAddInvoice = async (data: Partial<Invoice>) => {
    if (!user || !team) return;
    const path = 'invoices';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: user.uid,
        teamId: team.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await logAction('Created Invoice', 'invoice', docRef.id, `Invoice #${data.invoiceNumber}`);
      setShowInvoiceForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!team) return;
    const path = `invoices/${id}`;
    try {
      await deleteDoc(doc(db, 'invoices', id));
      await logAction('Deleted Invoice', 'invoice', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleAddExpense = async (data: Partial<Expense>) => {
    if (!user || !team) return;
    const path = 'expenses';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: user.uid,
        teamId: team.id,
        createdAt: Date.now(),
      });
      await logAction('Created Expense', 'expense', docRef.id, data.description);
      setShowExpenseForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!team) return;
    const path = `expenses/${id}`;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      await logAction('Deleted Expense', 'expense', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleAddClient = async (data: Partial<Client>) => {
    if (!user || !team) {
      console.warn('Cannot add client: User or Team not loaded');
      return;
    }
    const path = 'clients';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: user.uid,
        teamId: team.id,
        createdAt: Date.now(),
      });
      await logAction('Created Client', 'client', docRef.id, data.name);
      setShowClientForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!team) return;
    const path = `clients/${id}`;
    try {
      await deleteDoc(doc(db, 'clients', id));
      await logAction('Deleted Client', 'client', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleAddLead = async (data: Partial<Lead>) => {
    if (!user || !team) return;
    const path = editingLead ? `leads/${editingLead.id}` : 'leads';
    try {
      if (editingLead) {
        await updateDoc(doc(db, 'leads', editingLead.id), {
          ...data,
          updatedAt: Date.now(),
        });
        await logAction('Updated Lead', 'lead', editingLead.id, data.name);
      } else {
        const docRef = await addDoc(collection(db, 'leads'), {
          ...data,
          userId: user.uid,
          teamId: team.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await logAction('Created Lead', 'lead', docRef.id, data.name);
      }
      setShowLeadForm(false);
      setEditingLead(undefined);
    } catch (error) {
      handleFirestoreError(error, editingLead ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!team) return;
    const path = `leads/${id}`;
    try {
      await deleteDoc(doc(db, 'leads', id));
      await logAction('Deleted Lead', 'lead', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleUpdateProfile = async (data: CompanyProfile) => {
    if (!user || !team) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, data);
      await logAction('Updated Settings', 'settings', undefined, 'Company profile updated');
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `user_profiles/${user.uid}`;
    try {
      const profileRef = doc(db, 'user_profiles', user.uid);
      await updateDoc(profileRef, {
        ...data,
        updatedAt: Date.now()
      });
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
      if (data.photoURL) {
        await updateProfile(user, { photoURL: data.photoURL });
      }
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      await logAction('Updated Profile', 'profile', user.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    if (!user) return;
    try {
      await updatePassword(user, password);
      await logAction('Updated Password', 'profile', user.uid);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const handleUpdateCompanyProfile = async (data: Partial<CompanyProfile>) => {
    if (!user) return;
    const path = `profiles/${user.uid}`;
    try {
      await setDoc(doc(db, 'profiles', user.uid), data);
      setProfile(prev => ({ ...prev, ...data }));
      await logAction('Updated Company Settings', 'settings', user.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleInviteMember = async (email: string, role: UserRole) => {
    if (!team) return;
    const path = `teams/${team.id}`;
    try {
      const newUid = Math.random().toString(36).slice(2);
      const newMember = { uid: newUid, email, role, joinedAt: Date.now() };
      const newMembers = [...team.members, newMember];
      const newMemberRoles = { ...team.memberRoles, [newUid]: role };
      
      await updateDoc(doc(db, 'teams', team.id), { 
        members: newMembers,
        memberRoles: newMemberRoles
      });
      await logAction('Invited Member', 'team', team.id, `Invited ${email} as ${role}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (!team) return;
    const path = `teams/${team.id}`;
    try {
      const newMembers = team.members.filter(m => m.uid !== uid);
      const newMemberRoles = { ...team.memberRoles };
      delete newMemberRoles[uid];
      
      await updateDoc(doc(db, 'teams', team.id), { 
        members: newMembers,
        memberRoles: newMemberRoles
      });
      await logAction('Removed Member', 'team', team.id, `Removed member ${uid}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Loading Champspoint...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Access control: Only Superadmin or users with active profile can access
  if (!isSuperAdmin && (!userProfile || userProfile.status !== 'active')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <ShieldCheck className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-600 mb-6">
            Your account is currently pending approval or has been deactivated. 
            Please contact the Superadmin to gain access to the system.
          </p>
          <button
            onClick={logout}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={user.email}
        onLogout={logout}
        isSuperAdmin={isSuperAdmin}
      >
        {activeTab === 'dashboard' && (
          <Dashboard invoices={invoices} expenses={expenses} leads={leads} profile={profile} />
        )}

        {activeTab === 'invoices' && (
          showInvoiceForm ? (
            <InvoiceForm 
              clients={clients} 
              profile={profile}
              onSubmit={handleAddInvoice} 
              onCancel={() => setShowInvoiceForm(false)} 
              invoiceCount={invoices.length}
            />
          ) : (
            <InvoiceList 
              invoices={invoices} 
              clients={clients}
              profile={profile}
              onNewInvoice={() => setShowInvoiceForm(true)}
              onViewInvoice={(inv) => {
                setEditingInvoice(inv);
                // In a real app, we'd show a detail view
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onUpdateStatus={(id, status) => {
                updateDoc(doc(db, 'invoices', id), { status, updatedAt: Date.now() });
              }}
              onDownloadPDF={(invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                generateInvoicePDF(invoice, profile, client);
              }}
            />
          )
        )}

        {activeTab === 'expenses' && (
          showExpenseForm ? (
            <ExpenseForm 
              profile={profile}
              onSubmit={handleAddExpense} 
              onCancel={() => setShowExpenseForm(false)} 
            />
          ) : (
            <ExpenseList 
              expenses={expenses} 
              profile={profile}
              onNewExpense={() => setShowExpenseForm(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          )
        )}

        {activeTab === 'clients' && (
          showClientForm ? (
            <ClientForm 
              onSubmit={handleAddClient} 
              onCancel={() => setShowClientForm(false)} 
            />
          ) : (
            <ClientList 
              clients={clients} 
              onNewClient={() => setShowClientForm(true)}
              onDeleteClient={handleDeleteClient}
            />
          )
        )}

        {activeTab === 'leads' && (
          showLeadForm ? (
            <LeadForm 
              profile={profile}
              onSubmit={handleAddLead} 
              onCancel={() => {
                setShowLeadForm(false);
                setEditingLead(undefined);
              }} 
              initialData={editingLead}
            />
          ) : (
            <LeadList 
              leads={leads} 
              profile={profile}
              onNewLead={() => setShowLeadForm(true)}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setShowLeadForm(true);
              }}
              onDeleteLead={handleDeleteLead}
            />
          )
        )}

        {activeTab === 'team' && (
          <TeamManagement 
            team={team} 
            onUpdateTeam={async (data) => {
              if (!team) return;
              await updateDoc(doc(db, 'teams', team.id), data);
              await logAction('Updated Team', 'team', team.id, 'Team settings updated');
            }}
            onInviteMember={handleInviteMember}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogs logs={auditLogs} />
        )}

        {activeTab === 'settings' && (
          <Settings 
            profile={profile} 
            userProfile={userProfile}
            onUpdateProfile={handleUpdateCompanyProfile} 
            onUpdateUserProfile={handleUpdateUserProfile}
            onUpdatePassword={handleUpdatePassword}
          />
        )}

        {activeTab === 'superadmin' && isSuperAdmin && (
          <SuperAdminDashboard />
        )}
      </Layout>
    </ErrorBoundary>
  );
}

