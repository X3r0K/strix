'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateTarget } from '@/hooks/useApi'

const targetSchema = z.object({
  name: z.string().min(1, 'Target name is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['web', 'api', 'codebase']),
})

type TargetFormData = z.infer<typeof targetSchema>

interface TargetFormProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function TargetForm({ projectId, isOpen, onClose }: TargetFormProps) {
  const createTarget = useCreateTarget()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      type: 'web',
    },
  })

  const onSubmit = async (data: TargetFormData) => {
    try {
      await createTarget.mutateAsync({
        projectId,
        ...data,
      })
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to create target:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Target</DialogTitle>
            <DialogDescription>
              Add a new target to this project for security testing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Target Name
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Main Web Application"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Target URL
              </label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://example.com"
              />
              {errors.url && (
                <p className="text-sm text-red-600">{errors.url.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Target Type
              </label>
              <select
                id="type"
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="web">Web Application</option>
                <option value="api">API</option>
                <option value="codebase">Codebase</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createTarget.isPending}
            >
              {createTarget.isPending ? 'Adding...' : 'Add Target'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}