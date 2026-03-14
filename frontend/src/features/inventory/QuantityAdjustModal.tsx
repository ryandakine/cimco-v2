import { useState } from 'react';
import { AlertCircle, Minus, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAdjustQuantity } from './useParts';
import { formatNumber, getQuantityColor } from '@/utils/formatters';
import { validateQuantityAdjustment } from '@/utils/validators';
import type { Part } from '@/types';

interface QuantityAdjustModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuantityAdjustModal({ part, isOpen, onClose }: QuantityAdjustModalProps) {
  const [changeAmount, setChangeAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const adjustQuantity = useAdjustQuantity();

  if (!part) return null;

  const handleClose = () => {
    setChangeAmount('');
    setReason('');
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const adjustment = {
      part_id: part.id,
      change_amount: parseInt(changeAmount) || 0,
      reason: reason.trim(),
    };

    // Validate
    const validationErrors = validateQuantityAdjustment(adjustment);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // Check if new quantity would be negative
    const newQuantity = part.quantity + adjustment.change_amount;
    if (newQuantity < 0) {
      setErrors({ change_amount: `Cannot reduce below 0. Current: ${part.quantity}` });
      return;
    }

    try {
      await adjustQuantity.mutateAsync(adjustment);
      handleClose();
    } catch (error) {
      const apiError = error as { message: string };
      setErrors({ submit: apiError.message || 'Failed to adjust quantity' });
    }
  };

  const newQuantity = part.quantity + (parseInt(changeAmount) || 0);
  const isIncrease = (parseInt(changeAmount) || 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adjust Quantity"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Part Info */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <h4 className="font-medium text-white mb-1">{part.name}</h4>
          {part.part_number && (
            <p className="text-sm text-slate-400 mb-2">Part #: {part.part_number}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-slate-500">Current: </span>
              <span className={getQuantityColor(part.quantity, part.min_quantity)}>
                {formatNumber(part.quantity)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Min: </span>
              <span className="text-slate-300">{part.min_quantity}</span>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errors.submit}
          </div>
        )}

        {/* Change Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Change Amount
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChangeAmount(prev => String((parseInt(prev) || 0) - 1))}
              className="p-2"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={changeAmount}
              onChange={(e) => setChangeAmount(e.target.value)}
              error={errors.change_amount}
              placeholder="Enter amount"
              className="flex-1 text-center"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChangeAmount(prev => String((parseInt(prev) || 0) + 1))}
              className="p-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Use positive numbers to add, negative to subtract
          </p>
        </div>

        {/* New Quantity Preview */}
        {changeAmount && !isNaN(parseInt(changeAmount)) && parseInt(changeAmount) !== 0 && (
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-400">New quantity will be:</span>
            <Badge 
              variant={isIncrease ? 'success' : 'warning'}
              size="lg"
            >
              {formatNumber(newQuantity)}
            </Badge>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you adjusting the quantity?"
            rows={3}
            className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${
              errors.reason ? 'border-red-500' : 'border-slate-700'
            }`}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-400">{errors.reason}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={adjustQuantity.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={adjustQuantity.isPending}
            disabled={!changeAmount || !reason.trim()}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
