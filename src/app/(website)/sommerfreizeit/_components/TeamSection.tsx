'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Team } from '@/payload-types'

import { createAvatar } from '@dicebear/core'
import { bigEarsNeutral } from '@dicebear/collection'

interface TeamSectionProps {
  team: (Team | string)[]
}

function isTeam(member: Team | string): member is Team {
  return typeof member !== 'string'
}

export default function TeamSection({ team }: TeamSectionProps) {
  return (
    <section id="team" className="mx-auto max-w-(--breakpoint-lg) space-y-6 p-6">
      <h2 className="text-center text-4xl font-bold sm:text-5xl">Unser Team</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-5">
        {team.filter(isTeam).map((member, index) => (
          <Link href={`/team/${member.id}`} key={index} className="group relative max-w-sm">
            <div className="bg-primary group-hover:bg-primary/80 relative aspect-2/3 size-full rounded-lg">
              {typeof member.profilePicture === 'object' && member.profilePicture !== null ? (
                <Image
                  className="rounded-lg object-cover"
                  src={(member.profilePicture as { url: string }).url}
                  alt={`${member.firstName} ${member.lastName}`}
                  fill
                />
              ) : (
                <Image
                  className="rounded-lg object-cover"
                  src={createAvatar(bigEarsNeutral, {
                    seed: `${member.firstName} ${member.lastName}`,
                    backgroundColor: ['transparent'],
                    scale: 70,
                    randomizeIds: true,
                  }).toDataUri()}
                  alt={`${member.firstName} ${member.lastName}`}
                  fill
                />
              )}
            </div>
            <div className="absolute right-0 bottom-0 left-0 py-2">
              <p className="font-handwriting text-center text-2xl text-white group-hover:rotate-5 md:text-3xl">
                {member.firstName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
