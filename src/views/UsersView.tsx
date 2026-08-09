import React, { useState } from 'react';
import { Users, Plus, Shield, UserCheck, Edit2, Trash2, Lock } from 'lucide-react';
import { User } from '../types';
import { api } from '../lib/api';

interface UsersViewProps {
  users: User[];
  onRefresh: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'KASIR' as 'OWNER' | 'KASIR',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    password: '',
    pin: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openAddUser = () => {
    setEditingUser(null);
    setFormData({ username: '', name: '', role: 'KASIR', status: 'ACTIVE', password: '', pin: '' });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      password: '',
      pin: ''
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingUser) {
        const updatePayload: any = {
          name: formData.name,
          role: formData.role,
          status: formData.status
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }
        if (formData.pin.trim()) {
          updatePayload.pin = formData.pin.trim();
        }
        await api.updateUser(editingUser.id, updatePayload);
      } else {
        await api.createUser(formData);
      }
      onRefresh();
      setShowModal(false);
      setFormData({ username: '', name: '', role: 'KASIR', status: 'ACTIVE', password: '', pin: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Yakin ingin menghapus akun "${user.name}" (${user.username})?`)) {
      try {
        await api.deleteUser(user.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus user.');
      }
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.updateUser(user.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Pengelolaan Pengguna & Akun Kasir</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Atur hak akses akun Owner dan Kasir yang bertugas di toko retail.
          </p>
        </div>

        <button
          onClick={openAddUser}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={u.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{u.name}</span>
                  {u.role === 'OWNER' && <Shield className="w-3.5 h-3.5 text-emerald-600" />}
                </h3>
                <p className="text-xs font-mono text-slate-400">@{u.username}</p>

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'OWNER'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {u.username !== 'owner' && (
                <button
                  type="button"
                  onClick={() => toggleStatus(u)}
                  className="px-2.5 py-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              )}
              <button
                type="button"
                onClick={() => openEditUser(u)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                title="Edit Akun"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {u.username !== 'owner' && (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                  title="Hapus Akun"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingUser ? 'Edit Data Pengguna' : 'Pendaftaran Akun Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3 text-xs">
              {errorMsg && <p className="text-rose-600 font-bold">{errorMsg}</p>}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Siti Rahma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="kasir3"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password Initial</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '(Kosongkan jika tidak ubah password)' : 'password123'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">PIN Kunci Layar (Opsional)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  placeholder={editingUser ? '(Kosongkan jika tidak ubah PIN)' : 'Contoh: 123456'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Peran</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                >
                  <option value="KASIR">Kasir (Akses POS & Produk saja)</option>
                  <option value="OWNER">Owner (Akses Penuh)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Simpan Akun Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
