import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  UserPlus, 
  Phone, 
  Mail, 
  Trash2, 
  Edit2, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Bell, 
  BellOff
} from 'lucide-react';

export default function EmergencyContactsScreen({ onBack }) {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [autoNotify, setAutoNotify] = useState(true);

  // Test SMS result modal
  const [testSmsResult, setTestSmsResult] = useState(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContacts(currentUser?.id);
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentUser]);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Family');
    setPhone('');
    setEmail('');
    setAutoNotify(true);
    setShowModal(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship || 'Friend');
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setAutoNotify(contact.autoNotify);
    setShowModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          name,
          relationship,
          phone,
          email,
          autoNotify
        });
      } else {
        await api.addContact({
          userId: currentUser?.id,
          name,
          relationship,
          phone,
          email,
          autoNotify
        });
      }
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to remove this emergency contact?')) {
      try {
        await api.deleteContact(id);
        fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  const handleToggleAutoNotify = async (contact) => {
    try {
      await api.updateContact(contact.id, {
        autoNotify: !contact.autoNotify
      });
      fetchContacts();
    } catch (err) {
      console.error('Failed to toggle auto notify:', err);
    }
  };

  const handleSendTestSms = async (contact) => {
    setIsSendingTest(true);
    try {
      const res = await api.sendTestSms(contact.id, currentUser?.name);
      setTestSmsResult(res.smsResult);
    } catch (err) {
      console.error('Failed to send test SMS:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Trusted Emergency Contacts
        </h2>
        <button
          onClick={openAddModal}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3.5 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Contacts marked with <strong className="text-emerald-700 dark:text-emerald-400">Auto-Alert</strong> will immediately receive an automated SMS with your live GPS tracking map whenever you submit an emergency report or trigger Quick SOS.
        </p>
      </div>

      {/* Contacts List */}
      <div className="space-y-2.5">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {contact.name}
                  </h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {contact.phone}
                  </span>
                  {contact.email && (
                    <span className="hidden sm:flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {contact.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(contact)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60"
                  title="Remove contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom notification controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => handleToggleAutoNotify(contact)}
                className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded-lg transition ${
                  contact.autoNotify
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'text-slate-400 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                {contact.autoNotify ? (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Auto-Alert Active</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3.5 h-3.5" />
                    <span>Auto-Alert Off</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSendTestSms(contact)}
                disabled={isSendingTest}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Send className="w-3 h-3 text-rose-500" />
                <span>Test SMS Alert</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingContact ? 'Edit Emergency Contact' : 'Add Trusted Contact'}
            </h3>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sophia Rostova"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="Family">Family Member</option>
                  <option value="Sister">Sister</option>
                  <option value="Mother">Mother</option>
                  <option value="Partner">Partner</option>
                  <option value="Best Friend">Best Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number (for SMS) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@email.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Notify on Emergency Reports & SOS
                </span>
                <input
                  type="checkbox"
                  checked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test SMS simulator popup */}
      {testSmsResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulated SMS Dispatched
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              To: <strong>{testSmsResult.recipientName}</strong> ({testSmsResult.recipientPhone})
            </p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl font-mono text-[11px] leading-relaxed shadow-inner">
              {testSmsResult.messageBody}
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              Simulation Notice: Verified delivery via SafeHer Mock Carrier Gateway.
            </div>
            <button
              onClick={() => setTestSmsResult(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
