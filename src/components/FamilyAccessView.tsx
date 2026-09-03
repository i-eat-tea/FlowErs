/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Family Access — list/add/edit/remove family members with view/edit permissions.
 * Backed by `family_members` table (motherProfileId, name, phone, relation, canEdit).
 */

import React, { useState, useEffect } from 'react';
import {
  UserCircle, Plus, Edit3, Trash2, X, Check, Phone, Users
} from 'lucide-react';
import { TRANSLATIONS } from '../data';

export interface FamilyMember {
  id: string;
  motherProfileId: string;
  name: string;
  phone: string;
  relation: string;
  canEdit: boolean;
}

interface FamilyAccessViewProps {
  motherProfileId: string;
  lang: 'en' | 'kh';
  onAdd: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  onUpdate: (member: FamilyMember) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RELATIONS = ['Partner', 'Husband', 'Sibling', 'Parent', 'Other'];

export default function FamilyAccessView({
  motherProfileId,
  lang,
  onAdd,
  onUpdate,
  onDelete
}: FamilyAccessViewProps) {
  const t = TRANSLATIONS[lang] as any;
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);

  // Form state (used for both add and edit)
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelation, setFormRelation] = useState('Partner');
  const [formCanEdit, setFormCanEdit] = useState(false);

  // Load family members for this mother profile
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/family-members/${motherProfileId}`);
        if (res.ok && mounted) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error('Failed to load family members:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [motherProfileId]);

  function openAdd() {
    setEditing(null);
    setFormName('');
    setFormPhone('');
    setFormRelation('Partner');
    setFormCanEdit(false);
    setModalOpen(true);
  }

  function openEdit(m: FamilyMember) {
    setEditing(m);
    setFormName(m.name);
    setFormPhone(m.phone);
    setFormRelation(m.relation || 'Partner');
    setFormCanEdit(m.canEdit);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (editing) {
      const updated: FamilyMember = {
        ...editing,
        name: formName.trim(),
        phone: formPhone.trim(),
        relation: formRelation,
        canEdit: formCanEdit
      };
      await onUpdate(updated);
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    } else {
      const newMember: Omit<FamilyMember, 'id'> = {
        motherProfileId,
        name: formName.trim(),
        phone: formPhone.trim(),
        relation: formRelation,
        canEdit: formCanEdit
      };
      await onAdd(newMember);
      // Optimistic local update — refetch in background for full list
      const res = await fetch(`/api/family-members/${motherProfileId}`);
      if (res.ok) setMembers(await res.json());
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === 'en' ? 'Remove this family member?' : 'លុបសម័យនេះ?')) return;
    await onDelete(id);
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#AEE3D8] via-[#BCECE3] to-[#9CDFD2] rounded-[26px] p-5 text-[#2F6F8F] shadow-sm border-2 border-[#7ECBBF] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight font-heading flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{lang === 'en' ? 'Family Access' : 'សម័យគ្រួសារ'}</span>
          </h2>
          <p className="text-[11px] mt-0.5 opacity-80">
            {lang === 'en'
              ? 'Let partners and family view or help manage your records'
              : 'អនុញ្ញាតឱ្យដៃគូ និងគ្រួសារមើលឬជួយគ្រប់គ្រងទិន្នន័យ'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-3 py-2 bg-white hover:bg-[#F6E5C3] text-[#2F6F8F] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all border border-[#7ECBBF] shadow-3xs flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Add' : 'បង្កើត'}</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-6 text-[#2F6F8F]/70 text-xs">
          {lang === 'en' ? 'Loading…' : 'កំពុងផ្ទុក…'}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#AEE3D8] p-6 text-center space-y-2">
          <UserCircle className="w-10 h-10 text-[#AEE3D8] mx-auto" />
          <p className="text-xs font-black text-[#2F6F8F]">
            {lang === 'en' ? 'No family members yet' : 'មិនទាន់មានសម័យ'}
          </p>
          <p className="text-[10px] text-[#2F6F8F]/70">
            {lang === 'en' ? 'Add a partner or family member to share access' : 'បន្ថែមដៃគូ ឬសមាជិកគ្រួសារ'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#AEE3D8]/50 p-3.5 flex items-center space-x-3 shadow-3xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#AEE3D8]/30 text-[#2F6F8F] flex items-center justify-center shrink-0">
                <UserCircle className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-[#2F6F8F] truncate">{m.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-black text-[#2F6F8F] bg-[#AEE3D8]/40 px-1.5 py-0.5 rounded-md">
                    {m.relation}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-[#2F6F8F]/70 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>{m.phone}</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${m.canEdit ? 'bg-[#AEE3D8] text-[#2F6F8F]' : 'bg-[#FFF7E9] text-[#2F6F8F]/70'}`}>
                    {m.canEdit
                      ? (lang === 'en' ? 'Can edit' : 'អាចកែប្រែ')
                      : (lang === 'en' ? 'View only' : 'មើលប៉ុណ្ណោះ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  className="p-1.5 bg-[#AEE3D8]/30 hover:bg-[#AEE3D8] text-[#2F6F8F] rounded-lg cursor-pointer transition-all"
                  title={lang === 'en' ? 'Edit' : 'កែ'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 bg-[#FDDEEC] hover:bg-[#F4A6B5] text-[#FA6B90] rounded-lg cursor-pointer transition-all"
                  title={lang === 'en' ? 'Remove' : 'លុប'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#2F6F8F]/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="w-full sm:max-w-md bg-[#FEFAFB] rounded-t-[32px] sm:rounded-[28px] border-t sm:border border-[#FDDEEC] shadow-2xl relative z-10 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#FDDEEC]">
              <h3 className="text-base font-black text-[#2F6F8F] font-heading">
                {editing
                  ? (lang === 'en' ? 'Edit Family Member' : 'កែសម័យ')
                  : (lang === 'en' ? 'Add Family Member' : 'បន្ថែមសម័យ')}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 bg-[#FFF7E9] hover:bg-[#F6E5C3] rounded-full text-[#2F6F8F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#2F6F8F]">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">
                  {lang === 'en' ? 'Name' : 'ឈ្មោះ'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  placeholder={lang === 'en' ? 'e.g. Sokha Chea' : 'ឧ. សុខា ជា'}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">
                  {lang === 'en' ? 'Phone' : 'ទូរសព្ទ'}
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  placeholder="+855-12-345-6789"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">
                  {lang === 'en' ? 'Relation' : 'ទំនាក់ទំនង'}
                </label>
                <select
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                >
                  {RELATIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center space-x-2 p-2.5 bg-[#AEE3D8]/20 rounded-xl border border-[#AEE3D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formCanEdit}
                  onChange={(e) => setFormCanEdit(e.target.checked)}
                  className="w-4 h-4 accent-[#2D7A4F]"
                />
                <span className="text-[11px] font-black">
                  {lang === 'en' ? 'Allow this person to edit my records' : 'អនុញ្ញាតឱ្យកែប្រែទិន្នន័យ'}
                </span>
              </label>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-3 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] rounded-2xl font-black text-xs uppercase cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'បោះបង់'}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-[#2D7A4F] to-[#4A9D72] hover:from-[#246240] hover:to-[#3d8a64] text-white rounded-2xl font-black text-xs uppercase cursor-pointer shadow-3xs flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{editing ? (lang === 'en' ? 'Save' : 'រក្សាទុក') : (lang === 'en' ? 'Add Member' : 'បង្កើត')}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
