import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Loading, SkeletonCard } from '@/components/Loading';
import { usePart, useCreatePart, useUpdatePart, useCategories, useZones } from '@/features/inventory/useParts';
import { validatePart } from '@/utils/validators';
import type { Part } from '@/types';

type PartFormData = Omit<Part, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_FORM: PartFormData = {
  name: '',
  description: '',
  category: '',
  part_type: '',
  manufacturer: '',
  part_number: '',
  quantity: 0,
  min_quantity: 0,
  lead_time_days: 0,
  location: '',
  machine_location: '',
  function_description: '',
  zone: '',
  bom_reference: '',
  yard_label: '',
  unit_cost: undefined,
  supplier: '',
  wear_rating: undefined,
  tracked: false,
  image_url: '',
};

export function PartForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const partId = parseInt(id || '0');
  
  const { data: existingPart, isLoading: isLoadingPart } = usePart(partId, { enabled: isEditing });
  const { data: categories = [] } = useCategories();
  const { data: zones = [] } = useZones();
  
  const createPart = useCreatePart();
  const updatePart = useUpdatePart();
  
  const [formData, setFormData] = useState<PartFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data when editing
  useEffect(() => {
    if (existingPart) {
      setFormData({
        name: existingPart.name,
        description: existingPart.description || '',
        category: existingPart.category,
        part_type: existingPart.part_type || '',
        manufacturer: existingPart.manufacturer || '',
        part_number: existingPart.part_number || '',
        quantity: existingPart.quantity,
        min_quantity: existingPart.min_quantity,
        lead_time_days: existingPart.lead_time_days,
        location: existingPart.location || '',
        machine_location: existingPart.machine_location || '',
        function_description: existingPart.function_description || '',
        zone: existingPart.zone || '',
        bom_reference: existingPart.bom_reference || '',
        yard_label: existingPart.yard_label || '',
        unit_cost: existingPart.unit_cost,
        supplier: existingPart.supplier || '',
        wear_rating: existingPart.wear_rating,
        tracked: existingPart.tracked,
        image_url: existingPart.image_url || '',
      });
    }
  }, [existingPart]);

  const isLoading = isEditing ? isLoadingPart : false;
  const isSubmitting = createPart.isPending || updatePart.isPending;

  const handleChange = (field: keyof PartFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number' 
        ? parseFloat(e.target.value) || 0 
        : e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validatePart(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      if (isEditing) {
        await updatePart.mutateAsync({ id: partId, part: formData });
        navigate(`/inventory/${partId}`);
      } else {
        const newPart = await createPart.mutateAsync(formData);
        navigate(`/inventory/${newPart.id}`);
      }
    } catch (error) {
      const apiError = error as { message: string; errors?: Record<string, string[]> };
      if (apiError.errors) {
        const errorMap: Record<string, string> = {};
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          errorMap[field] = messages[0];
        });
        setErrors(errorMap);
      } else {
        setErrors({ submit: apiError.message || 'Failed to save part' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SkeletonCard className="w-48 h-8" />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map(c => ({ value: c, label: c })),
  ];

  const zoneOptions = [
    { value: '', label: 'Select a zone' },
    ...zones.map(z => ({ value: z, label: z })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(isEditing ? `/inventory/${partId}` : '/inventory')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Part' : 'Add New Part'}
          </h1>
        </div>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {isEditing ? 'Save Changes' : 'Create Part'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertCircle className="h-5 w-5" />
            {errors.submit}
          </div>
        )}

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              required
            />
            
            <Input
              label="Part Number"
              value={formData.part_number}
              onChange={handleChange('part_number')}
              error={errors.part_number}
              placeholder="e.g., P-00123"
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, category: value }));
                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
              }}
              options={categoryOptions}
              error={errors.category}
              required
            />

            <Input
              label="Part Type"
              value={formData.part_type}
              onChange={handleChange('part_type')}
              error={errors.part_type}
              placeholder="e.g., Hydraulic, Electrical"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                }}
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Inventory Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              error={errors.quantity}
              required
              min={0}
            />

            <Input
              label="Min Quantity"
              type="number"
              value={formData.min_quantity}
              onChange={handleChange('min_quantity')}
              error={errors.min_quantity}
              required
              min={0}
            />

            <Input
              label="Lead Time (days)"
              type="number"
              value={formData.lead_time_days}
              onChange={handleChange('lead_time_days')}
              error={errors.lead_time_days}
              required
              min={0}
            />

            <Input
              label="Unit Cost"
              type="number"
              step="0.01"
              value={formData.unit_cost || ''}
              onChange={handleChange('unit_cost')}
              error={errors.unit_cost}
              placeholder="0.00"
            />

            <Select
              label="Zone"
              value={formData.zone}
              onChange={(value) => setFormData(prev => ({ ...prev, zone: value }))}
              options={zoneOptions}
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={handleChange('location')}
              error={errors.location}
              placeholder="e.g., Shelf A-12"
            />

            <Input
              label="Machine Location"
              value={formData.machine_location}
              onChange={handleChange('machine_location')}
              error={errors.machine_location}
              placeholder="e.g., Press #3"
            />

            <Input
              label="Yard Label"
              value={formData.yard_label}
              onChange={handleChange('yard_label')}
              error={errors.yard_label}
            />

            <Input
              label="Wear Rating"
              type="number"
              min={0}
              max={10}
              value={formData.wear_rating ?? ''}
              onChange={handleChange('wear_rating')}
              error={errors.wear_rating}
              placeholder="0-10"
            />

            <div className="flex items-center gap-3 md:col-span-3">
              <input
                type="checkbox"
                id="tracked"
                checked={formData.tracked}
                onChange={handleChange('tracked')}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="tracked" className="text-sm text-slate-300">
                Track this part (enable detailed history tracking)
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Supplier Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Manufacturer"
              value={formData.manufacturer}
              onChange={handleChange('manufacturer')}
              error={errors.manufacturer}
            />

            <Input
              label="Supplier"
              value={formData.supplier}
              onChange={handleChange('supplier')}
              error={errors.supplier}
            />

            <Input
              label="BOM Reference"
              value={formData.bom_reference}
              onChange={handleChange('bom_reference')}
              error={errors.bom_reference}
            />

            <Input
              label="Image URL"
              value={formData.image_url}
              onChange={handleChange('image_url')}
              error={errors.image_url}
              placeholder="https://..."
            />
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Function Description</h2>
          <textarea
            value={formData.function_description}
            onChange={(e) => setFormData(prev => ({ ...prev, function_description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            placeholder="Describe the function and purpose of this part..."
          />
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEditing ? `/inventory/${partId}` : '/inventory')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Part'}
          </Button>
        </div>
      </form>
    </div>
  );
}
