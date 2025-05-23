'use client'

import React from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'

import type { Team } from '@/payload-types'

interface TeamSectionProps {
  team: (Team | string)[]
}

export default function TeamSection({ team }: TeamSectionProps) {
  return (
    <section id="team">
      <h1 className="p-6 text-center text-4xl font-bold">Unser Team</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {team.map((member, index) => (
          <Link
            key={typeof member === 'string' ? `member-${index}` : member.id}
            href={typeof member !== 'string' ? `/team/${member.id}` : '#'}
            className="block"
          >
            <Card className="my-auto cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="max-w-sm">
                {typeof member !== 'string' && (
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">
                      {`${member.firstName} ${member.lastName}`}
                    </div>
                    {member.email && <Mail className="size-5" />}
                  </div>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
