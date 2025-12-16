'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import VaccineTemplateDialog from './VaccineTemplateDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VaccineTemplate {
  _id: string;
  name: string;
  defaultCost: number;
  ageInDays: number;
  description?: string;
  active: boolean;
}

export default function VaccineTemplateList() {
  const [templates, setTemplates] = useState<VaccineTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<VaccineTemplate | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/vaccine-templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch vaccine templates:', error);
      toast.error('Failed to load vaccine templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = () => {
    setDialogOpen(false);
    setSelectedTemplate(undefined);
    fetchTemplates();
  };

  const handleEdit = (template: VaccineTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/vaccine-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template status');
      }

      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update template status');
    }
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/vaccine-templates/${templateToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete template');
      }

      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vaccine Templates</CardTitle>
              <CardDescription>
                Manage vaccine templates for automatic scheduling when creating batches
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center flex-col gap-2">
              <p className="text-gray-500">No vaccine templates created yet</p>
              <Button onClick={() => setDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first template
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vaccine Name</TableHead>
                    <TableHead>Age (Days)</TableHead>
                    <TableHead>Default Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">
                        <div>
                          {template.name}
                          {template.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>Day {template.ageInDays}</TableCell>
                      <TableCell>{formatCurrency(template.defaultCost)}</TableCell>
                      <TableCell>
                        {template.active ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-600">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(template._id, template.active)}
                          >
                            {template.active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(template._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VaccineTemplateDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedTemplate(undefined);
        }}
        template={selectedTemplate}
        onSuccess={handleCreateOrUpdate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vaccine Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vaccine template.
              If this template is referenced by any vaccinations, the deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
