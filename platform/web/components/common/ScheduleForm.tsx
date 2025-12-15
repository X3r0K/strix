'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateScan } from '@/hooks/useApi'

const scheduleSchema = z.object({
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday, 6 = Saturday
  dayOfMonth: z.number().min(1).max(31).optional(),
  cronExpression: z.string().optional(),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

interface ScheduleFormProps {
  projectId: string
  targetId: string
  isOpen: boolean
  onClose: () => void
}

const cronExamples = {
  once: 'Run once immediately',
  daily: '0 9 * * * (Every day at 9:00 AM)',
  weekly: '0 9 * * 1 (Every Monday at 9:00 AM)',
  monthly: '0 9 1 * * (First day of every month at 9:00 AM)',
}

export function ScheduleForm({ projectId, targetId, isOpen, onClose }: ScheduleFormProps) {
  const createScan = useCreateScan()
  const [showCronHelper, setShowCronHelper] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      frequency: 'once',
      time: '09:00',
    },
  })

  const frequency = watch('frequency')

  const generateCronExpression = (data: ScheduleFormData): string => {
    const [hours, minutes] = data.time.split(':').map(Number)
    
    switch (data.frequency) {
      case 'once':
        return 'run-immediately'
      case 'daily':
        return `${minutes} ${hours} * * *`
      case 'weekly':
        const dayOfWeek = data.dayOfWeek || 1 // Default to Monday
        return `${minutes} ${hours} * * ${dayOfWeek}`
      case 'monthly':
        const dayOfMonth = data.dayOfMonth || 1 // Default to 1st
        return `${minutes} ${hours} ${dayOfMonth} * *`
      default:
        return `${minutes} ${hours} * * *`
    }
  }

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      const cronExpression = generateCronExpression(data)
      
      if (data.frequency === 'once') {
        // Run immediately
        await createScan.mutateAsync({
          projectId,
          targetId,
        })
      } else {
        // Schedule for later (in a real app, this would call a scheduling API)
        console.log('Scheduling scan with cron:', cronExpression)
        alert(`Scan scheduled with cron expression: ${cronExpression}`)
      }
      
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to schedule scan:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Schedule Security Scan</DialogTitle>
            <DialogDescription>
              Set up automated security testing for this target.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="frequency" className="text-sm font-medium">
                Frequency
              </label>
              <select
                id="frequency"
                {...register('frequency')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="once">Run Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.frequency && (
                <p className="text-sm text-red-600">{errors.frequency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>

            {frequency === 'weekly' && (
              <div className="space-y-2">
                <label htmlFor="dayOfWeek" className="text-sm font-medium">
                  Day of Week
                </label>
                <select
                  id="dayOfWeek"
                  {...register('dayOfWeek', { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                  <option value={0}>Sunday</option>
                </select>
                {errors.dayOfWeek && (
                  <p className="text-sm text-red-600">{errors.dayOfWeek.message}</p>
                )}
              </div>
            )}

            {frequency === 'monthly' && (
              <div className="space-y-2">
                <label htmlFor="dayOfMonth" className="text-sm font-medium">
                  Day of Month
                </label>
                <select
                  id="dayOfMonth"
                  {...register('dayOfMonth', { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                    </option>
                  ))}
                </select>
                {errors.dayOfMonth && (
                  <p className="text-sm text-red-600">{errors.dayOfMonth.message}</p>
                )}
              </div>
            )}

            {/* Cron Expression Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Cron Expression</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCronHelper(!showCronHelper)}
                >
                  {showCronHelper ? 'Hide' : 'Show'} Helper
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                {generateCronExpression(watch())}
              </div>
              {showCronHelper && (
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">Cron Format: minute hour day month weekday</p>
                  <p>• minute: 0-59</p>
                  <p>• hour: 0-23</p>
                  <p>• day: 1-31</p>
                  <p>• month: 1-12</p>
                  <p>• weekday: 0-6 (0=Sunday)</p>
                  <p className="mt-2">Examples:</p>
                  <p>• 0 9 * * * = 9:00 AM daily</p>
                  <p>• 0 9 * * 1 = 9:00 AM every Monday</p>
                  <p>• 0 9 1 * * = 9:00 AM on 1st of every month</p>
                </div>
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
              disabled={isSubmitting || createScan.isPending}
            >
              {createScan.isPending ? 'Scheduling...' : 
               frequency === 'once' ? 'Run Now' : 'Schedule Scan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}