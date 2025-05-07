'use client'

import React from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

export default function Newsletter({
  title,
  subtitle,
  list,
}: {
  title: string
  subtitle: string
  list: { name: string; value: string; hidden: boolean }[]
}) {
  const formSchema = z.object({
    name: z.string().min(1, {
      message: 'Please enter your name.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: 'You have to select at least one item.',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      items: [],
    },
  })

  return (
    <section className="mx-auto max-w-(--breakpoint-md)">
      <div className="mx-auto text-center">
        <h2 className="text-3xl font-extrabold">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      </div>
      <form
        method="post"
        action="https://listmonk.kjg-dossenheim.org/subscription/form"
      >
        <div className='max-w-xl mx-auto flex flex-col justify-center'>
          <Input type="hidden" name="nonce" />
          <div className='flex space-x-2'>
            <Input type="email" name="email" required placeholder="E-Mail" />
            <Input type="text" name="name" placeholder="Name (optional)" />
            <Button type="submit" value="Abonnieren">Abonnieren</Button>
          </div>
        <div className='mx-auto'>
          {list.map((item) => (
            !item.hidden && (
              <div key={item.value}>
                <Checkbox
                  id={item.value}
                  name="l"
                  value={item.value}
                />
                <label htmlFor={item.value}>{item.name}</label>
              </div>
            )
          ))}
        </div>
        <div className="mx-auto">
        <HCaptcha sitekey='cad8db93-7a15-412d-9339-c091d6643a64' />
        </div>
        </div>
      </form>
    </section>
  )
}
