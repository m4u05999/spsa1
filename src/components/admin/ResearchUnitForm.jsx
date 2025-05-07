// src/components/admin/ResearchUnitForm.jsx
import React, { useState } from 'react';

const ResearchUnitForm = ({ unit = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: unit?.name || '',
    description: unit?.description || '',
    type: unit?.type || 'regional', // regional, international, ideological
    parentUnit: unit?.parentUnit || '',
    head: unit?.head || '',
    members: unit?.members || [],
    contactEmail: unit?.contactEmail || '',
    image: unit?.image || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قائمة أنواع الوحدات البحثية
  const unitTypes = [
    { value: 'regional', label: 'دراسات إقليمية' },
    { value: 'international', label: 'علاقات دولية' },
    { value: 'comparative', label: 'سياسات مقارنة' },
    { value: 'ideological', label: 'فكر سياسي ونظرية سياسية' }
  ];

  // معالج تغييرات الإدخال
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // مسح رسائل الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  // إضافة عضو جديد للوحدة
  const [newMember, setNewMember] = useState({ name: '', position: '', email: '', specialization: '' });

  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const addMember = () => {
    if (newMember.name && newMember.position) {
      setFormData(prevState => ({
        ...prevState,
        members: [...prevState.members, { ...newMember, id: Date.now() }]
      }));
      setNewMember({ name: '', position: '', email: '', specialization: '' });
    }
  };

  const removeMember = (id) => {
    setFormData(prevState => ({
      ...prevState,
      members: prevState.members.filter(member => member.id !== id)
    }));
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الوحدة البحثية مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'وصف الوحدة البحثية مطلوب';
    }
    
    if (!formData.type) {
      newErrors.type = 'نوع الوحدة البحثية مطلوب';
    }
    
    if (!formData.head.trim()) {
      newErrors.head = 'اسم رئيس الوحدة البحثية مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالج إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // استدعاء دالة الإرسال
        await onSubmit(formData);
      } catch (error) {
        console.error('خطأ في حفظ بيانات الوحدة البحثية:', error);
        setErrors({ submit: 'حدث خطأ أثناء حفظ البيانات' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
          اسم الوحدة البحثية*
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 text-right">
          نوع الوحدة البحثية*
        </label>
        <div className="mt-1">
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.type ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">اختر نوع الوحدة البحثية</option>
            {unitTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-2 text-sm text-red-600">{errors.type}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="parentUnit" className="block text-sm font-medium text-gray-700 text-right">
          الوحدة الأم (اختياري)
        </label>
        <div className="mt-1">
          <input
            id="parentUnit"
            name="parentUnit"
            type="text"
            value={formData.parentUnit}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-right">
          وصف الوحدة البحثية*
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          ></textarea>
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="head" className="block text-sm font-medium text-gray-700 text-right">
          رئيس الوحدة البحثية*
        </label>
        <div className="mt-1">
          <input
            id="head"
            name="head"
            type="text"
            value={formData.head}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.head ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.head && (
            <p className="mt-2 text-sm text-red-600">{errors.head}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 text-right">
          البريد الإلكتروني للتواصل
        </label>
        <div className="mt-1">
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 text-right">
          رابط الصورة
        </label>
        <div className="mt-1">
          <input
            id="image"
            name="image"
            type="text"
            value={formData.image}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium mb-3">أعضاء الوحدة البحثية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 text-right">
              الاسم
            </label>
            <input
              id="memberName"
              name="name"
              type="text"
              value={newMember.name}
              onChange={handleMemberInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="memberPosition" className="block text-sm font-medium text-gray-700 text-right">
              المنصب
            </label>
            <input
              id="memberPosition"
              name="position"
              type="text"
              value={newMember.position}
              onChange={handleMemberInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 text-right">
              البريد الإلكتروني
            </label>
            <input
              id="memberEmail"
              name="email"
              type="email"
              value={newMember.email}
              onChange={handleMemberInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="memberSpecialization" className="block text-sm font-medium text-gray-700 text-right">
              التخصص
            </label>
            <input
              id="memberSpecialization"
              name="specialization"
              type="text"
              value={newMember.specialization}
              onChange={handleMemberInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={addMember}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fas fa-plus ml-1"></i>
          إضافة عضو
        </button>

        {formData.members.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنصب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التخصص
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.specialization || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'جاري الحفظ...' : unit ? 'تحديث الوحدة البحثية' : 'إنشاء الوحدة البحثية'}
        </button>
      </div>
    </form>
  );
};

export default ResearchUnitForm;