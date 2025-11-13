'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import type { Team } from '@/payload-types'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

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
    <section id="team">
      <CardHeader>
        <h1 className="text-center text-4xl font-bold">Unser Team</h1>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {team.filter(isTeam).map((member, index) => (
          <Card key={index}>
            <Link href={`/team/${member.id}`}>
              <CardHeader>
                <Avatar className="aspect-2/3 size-full rounded-lg">
                  {typeof member.profilePicture === 'object' && member.profilePicture !== null ? (
                    <AvatarImage
                      className="object-cover"
                      src={(member.profilePicture as { url: string }).url}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  ) : (
                    <AvatarImage
                      className="bg-primary object-cover"
                      src={createAvatar(bigEarsNeutral, {
                        seed: `${member.firstName} ${member.lastName}`,
                        backgroundColor: ['transparent'],
                        scale: 70,
                        randomizeIds: true,
                      }).toDataUri()}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  )}
                </Avatar>
              </CardHeader>
              <CardFooter>
                <CardTitle className="font-handwriting text-center">
                  {member.firstName} {member.lastName}
                </CardTitle>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </CardContent>
    </section>
  )
}
