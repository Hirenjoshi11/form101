import React, { useState } from 'react';
import { X, Sliders, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { CertificateForm, FormField } from '@/lib/types';
import { ApiService } from '@/lib/api';

interface FormEditorModalProps {
  form: CertificateForm | null;
  onClose: () => void;
  onFormSaved: (saved: CertificateForm) => void;
  showToast: (msg: string) => void;
}

export const FormEditorModal: React.FC<FormEditorModalProps> = ({
  form,
  onClose,
  onFormSaved,
  showToast
}) => {
  if (!form) return null;

  const [formData, setFormData] = useState<CertificateForm>({ ...form });
  const [editorTab, setEditorTab] = useState<'meta' | 'fields'>('meta');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await ApiService.saveForm(formData);
      onFormSaved(saved);
      showToast(`Form & Rates "${saved.title_en}" saved successfully`);
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Failed to save form changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveField = (field: FormField) => {
    const currentFields = formData.fields || [];
    const idx = currentFields.findIndex(f => f.id === field.id || f.field_key === field.field_key);
    let updatedFields: FormField[];
    if (idx >= 0) {
      updatedFields = [...currentFields];
      updatedFields[idx] = field;
    } else {
      updatedFields = [...currentFields, field];
    }
    setFormData({ ...formData, fields: updatedFields });
    setEditingField(null);
    showToast(`Field "${field.label_en}" updated`);
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = (formData.fields || []).filter(f => f.id !== fieldId);
    setFormData({ ...formData, fields: updated });
    showToast('Field deleted');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-xl text-[#18232D]">
              Service & Rates Editor
            </h3>
            <p className="text-xs text-[#5B6470] mt-0.5">
              {formData.title_en} • Slug: <span className="font-mono font-bold text-[#159447]">{formData.slug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Tabs (Metadata vs Fields) */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setEditorTab('meta')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              editorTab === 'meta'
                ? 'bg-[#159447] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. General Info & Rates
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('fields')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              editorTab === 'fields'
                ? 'bg-[#159447] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Configure Form Fields ({formData.fields?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: FORM METADATA & RATES */}
        {editorTab === 'meta' && (
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  Title in English *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_en}
                  onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  Title in Gujarati *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_gu}
                  onChange={e => setFormData({ ...formData, title_gu: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  Official Government Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.official_fee}
                  onChange={e => setFormData({ ...formData, official_fee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  FormSeva Assisted Service Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.service_fee}
                  onChange={e => setFormData({ ...formData, service_fee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  Expected Turnaround SLA (Days)
                </label>
                <input
                  type="number"
                  value={formData.turnaround_days}
                  onChange={e => setFormData({ ...formData, turnaround_days: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#18232D] mb-1">
                  Expected OTP Count from Citizen
                </label>
                <input
                  type="number"
                  value={formData.expected_otp_count}
                  onChange={e => setFormData({ ...formData, expected_otp_count: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#159447]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18232D] mb-1">
                Department Authority (EN)
              </label>
              <input
                type="text"
                value={formData.department_name_en}
                onChange={e => setFormData({ ...formData, department_name_en: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18232D] mb-1">
                Service Description (EN)
              </label>
              <textarea
                rows={2}
                value={formData.description_en}
                onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300"
              />
            </div>

            {/* Public Citizen Visibility Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
              <div className="pr-4">
                <span className="block text-xs font-black text-[#18232D]">
                  Citizen Portal Visibility (Show / Hide)
                </span>
                <span className="block text-[11px] text-[#5B6470] mt-0.5">
                  {formData.is_active !== false
                    ? '🟢 Active: Citizens can view, search, and submit applications for this form.'
                    : '⚪ Inactive: Hidden from citizens. Applications temporarily paused.'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: formData.is_active === false ? true : false })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.is_active !== false ? 'bg-[#159447]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.is_active !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Form & Rates'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CONFIGURE EVERY SINGLE FORM FIELD */}
        {editorTab === 'fields' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#18232D]">Form Input Fields</h4>
                <p className="text-xs text-[#5B6470]">Add, edit label, validation, and field order</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingField({
                    id: `f-${Date.now()}`,
                    form_id: formData.id,
                    field_key: `field_${Date.now()}`,
                    step_section: 'personal',
                    field_type: 'text',
                    label_en: 'New Field Label',
                    label_gu: 'નવી વિગત',
                    label_hi: 'नया विवरण',
                    is_required: true,
                    sort_order: (formData.fields?.length || 0) + 1
                  })
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#159447] text-white text-xs font-bold shadow-2xs hover:bg-[#12803c] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New Field</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(formData.fields || []).map((field, idx) => (
                <div
                  key={field.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#18232D] text-sm">{field.label_en}</span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600">
                        {field.field_key}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#159447] bg-[#EAF6EE] px-2 py-0.5 rounded">
                        {field.field_type}
                      </span>
                      {field.is_required && (
                        <span className="text-[10px] text-red-600 font-bold">*Required</span>
                      )}
                    </div>
                    <div className="text-[#5B6470] mt-0.5">
                      GU: {field.label_gu} • Section: <span className="capitalize">{field.step_section}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingField(JSON.parse(JSON.stringify(field)))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-white text-slate-700"
                      title="Edit Field"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white"
                      title="Delete Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#159447] hover:bg-[#12803c] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Form Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* SUB-MODAL FOR FIELD EDITING */}
        {editingField && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-[#18232D]">Field Editor</h4>
                <button onClick={() => setEditingField(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Field Key (Unique)</label>
                    <input
                      type="text"
                      value={editingField.field_key}
                      onChange={e => setEditingField({ ...editingField, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Field Type</label>
                    <select
                      value={editingField.field_type}
                      onChange={e => setEditingField({ ...editingField, field_type: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="select">Dropdown (Select)</option>
                      <option value="date">Date Picker</option>
                      <option value="textarea">Textarea (Multi-line)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Label in English *</label>
                    <input
                      type="text"
                      value={editingField.label_en}
                      onChange={e => setEditingField({ ...editingField, label_en: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18232D] mb-1">Label in Gujarati *</label>
                    <input
                      type="text"
                      value={editingField.label_gu}
                      onChange={e => setEditingField({ ...editingField, label_gu: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18232D] mb-1">Form Section</label>
                  <select
                    value={editingField.step_section}
                    onChange={e => setEditingField({ ...editingField, step_section: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="personal">Personal Details</option>
                    <option value="address">Address & Location</option>
                    <option value="specific">Certificate Specific Details</option>
                    <option value="documents">Document Requirements</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="fieldReqCheck"
                    checked={editingField.is_required}
                    onChange={e => setEditingField({ ...editingField, is_required: e.target.checked })}
                    className="w-4 h-4 text-[#159447] rounded"
                  />
                  <label htmlFor="fieldReqCheck" className="text-xs font-bold text-[#18232D]">
                    This field is mandatory (required)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveField(editingField)}
                  className="px-5 py-2 rounded-xl bg-[#159447] text-white text-xs font-bold hover:bg-[#12803c]"
                >
                  Save Field
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
