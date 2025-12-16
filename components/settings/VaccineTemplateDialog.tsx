'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface VaccineTemplate {
  _id: string;
  name: string;
  defaultCost: number;
  ageInDays: number;
  description?: string;
  active: boolean;
}

interface VaccineTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: VaccineTemplate;
  onSuccess: () => void;
}

export default function VaccineTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: VaccineTemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ageInDays: '',
    defaultCost: '',
    description: '',
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        ageInDays: template.ageInDays.toString(),
        defaultCost: template.defaultCost.toString(),
        description: template.description || '',
      });
    } else {
      setFormData({
        name: '',
        ageInDays: '',
        defaultCost: '',
        description: '',
      });
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = template
        ? `/api/vaccine-templates/${template._id}`
        : '/api/vaccine-templates';
      const method = template ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          ageInDays: parseInt(formData.ageInDays),
          defaultCost: parseFloat(formData.defaultCost),
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${template ? 'update' : 'create'} template`);
      }

      toast.success(`Template ${template ? 'updated' : 'created'} successfully`);
      setFormData({ name: '', ageInDays: '', defaultCost: '', description: '' });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${template ? 'update' : 'create'} template`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit' : 'Create'} Vaccine Template</DialogTitle>
          <DialogDescription>
            {template
              ? 'Update the vaccine template details'
              : 'Create a new vaccine template for automatic scheduling'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vaccine Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Newcastle Disease, Gumboro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageInDays">Age in Days *</Label>
              <Input
                id="ageInDays"
                type="number"
                min="0"
                placeholder="e.g., 7"
                value={formData.ageInDays}
                onChange={(e) => setFormData({ ...formData, ageInDays: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Days after batch start date
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCost">Default Cost *</Label>
              <Input
                id="defaultCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 500"
                value={formData.defaultCost}
                onChange={(e) => setFormData({ ...formData, defaultCost: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Cost per vaccination
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this vaccine..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
