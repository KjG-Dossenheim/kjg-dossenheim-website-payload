'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Form } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldLabel, Field, FieldError } from '@/components/ui/field'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { RichText } from '@payloadcms/richtext-lexical/react'

type RichTextField = {
  root: {
    type: string
    children: {
      type: string
      version: number
      [k: string]: unknown
    }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [k: string]: unknown
}

type FormField = {
  blockType: string
  name?: string
  label?: string
  required?: boolean
  width?: string
  placeholder?: string
  defaultValue?: string | number | boolean
  options?: Array<{ label: string; value: string }>
  message?: RichTextField
  [key: string]: unknown // Allow additional properties
}

type FormSubmissionData = Record<string, string | number | boolean>

type FormClientProps = {
  form: Form
  introContent?: RichTextField
}

export const FormClient: React.FC<FormClientProps> = ({ form, introContent }) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm()

  const onSubmit = async (data: FormSubmissionData) => {
    try {
      const dataToSend = Object.entries(data).map(([name, value]) => ({
        field: name,
        value,
      }))

      const response = await fetch(`/api/form-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: form.id,
          submissionData: dataToSend,
        }),
      })

      if (!response.ok) {
        throw new Error('Form submission failed')
      }

      // Get confirmation message as string
      const confirmationMsg =
        typeof form.confirmationMessage === 'string'
          ? form.confirmationMessage
          : 'Thank you for your submission!'

      toast.success(confirmationMsg)
      reset()

      // Handle redirect if configured
      if (form.redirect) {
        // Handle redirect logic here if needed
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('There was an error submitting the form. Please try again.')
    }
  }

  const renderField = (field: FormField, index: number) => {
    const fieldName = field.name || `field_${index}`
    const isRequired = field.required || false

    switch (field.blockType) {
      case 'text':
      case 'email':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Input
                  id={fieldName}
                  type={field.blockType}
                  {...inputField}
                  placeholder={field.placeholder}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'textarea':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Textarea
                  id={fieldName}
                  {...inputField}
                  placeholder={field.placeholder}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'select':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Select value={inputField.value} onValueChange={inputField.onChange}>
                  <SelectTrigger id={fieldName}>
                    <SelectValue placeholder={field.placeholder || 'Select an option'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'radio':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel>{field.label}</FieldLabel>
                <RadioGroup value={inputField.value} onValueChange={inputField.onChange}>
                  {field.options?.map((option) => (
                    <Field
                      key={option.value}
                      orientation="horizontal"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <RadioGroupItem value={option.value} id={`${fieldName}-${option.value}`} />
                      <FieldLabel htmlFor={`${fieldName}-${option.value}`} className="font-normal">
                        {option.label}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'checkbox':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <div className="flex flex-row items-center gap-2">
                  <Checkbox
                    id={fieldName}
                    checked={inputField.value}
                    onCheckedChange={inputField.onChange}
                  />
                  <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'number':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Input
                  id={fieldName}
                  type="number"
                  {...inputField}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'date':
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Input
                  id={fieldName}
                  type="date"
                  {...inputField}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      case 'message':
        return (
          <div key={`message_${index}`} className="my-4" style={{ width: field.width || '100%' }}>
            {field.message && <RichText data={field.message} />}
          </div>
        )

      case 'state':
      case 'country':
        // These would need specific implementation with proper options
        return (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            rules={{ required: isRequired ? `${field.label} is required` : false }}
            render={({ field: inputField, fieldState }) => (
              <Field data-invalid={fieldState.invalid} style={{ width: field.width || '100%' }}>
                <FieldLabel htmlFor={fieldName}>{field.label}</FieldLabel>
                <Input
                  id={fieldName}
                  type="text"
                  {...inputField}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )

      default:
        return null
    }
  }

  if (!form || !form.fields) {
    return <div>No form fields configured</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Toaster richColors />
      {introContent && (
        <div className="mb-6">
          <RichText data={introContent} />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {form.fields.map((field, index: number) => renderField(field as FormField, index))}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : form.submitButtonLabel || 'Submit'}
        </Button>
      </form>
    </div>
  )
}
