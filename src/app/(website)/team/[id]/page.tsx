// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Third-party libraries
import { Mail, Phone } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'

import { createAvatar } from '@dicebear/core'
import { bigEarsNeutral } from '@dicebear/collection'

// UI Components
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Shared function to fetch team member data to avoid code duplication
async function getTeamMember(id: string) {
  if (!id) return null

  try {
    const payload = await getPayload({ config })
    return await payload.findByID({
      collection: 'team',
      id,
    })
  } catch (error) {
    console.error('Error fetching team member:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const member = await getTeamMember(id)
  if (!member) {
    return {
      title: `Team Member Not Found | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      description: '',
    }
  }

  return {
    title: `${member.firstName} ${member.lastName} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  }
}

// Dynamic route page that displays a single team member by ID
export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getTeamMember(id)

  if (!member) {
    return notFound()
  }

  return (
    <div className="px-4 py-8">
      <Card className="mx-auto max-w-md">
        <div className="flex flex-row items-center">
          <Avatar className="ml-6 size-14">
            {member.profilePicture ? (
              <AvatarImage
                src={(member.profilePicture as { url: string }).url}
                alt={`${member.firstName} ${member.lastName}`}
              />
            ) : (
              <AvatarImage
                className="bg-primary/20 object-cover"
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
          <CardHeader>
            <CardTitle>
              {member.firstName} {member.lastName}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-2" id="position">
              {member.position.map((pos) => (
                <Badge key={pos} variant="outline">
                  {pos.toUpperCase()}
                </Badge>
              ))}
            </CardDescription>
          </CardHeader>
        </div>
        {member.description && (
          <CardContent id="beschreibung">
            <h2 className="text-md font-semibold">Über mich</h2>
            <RichText data={member.description} />
          </CardContent>
        )}
        {(member.email || member.phone) && (
          <CardFooter className="flex flex-wrap gap-4">
            {member.email && (
              <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                <Link href={`mailto:${member.email}`} className="flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  <span>{member.email}</span>
                </Link>
              </Button>
            )}
            {member.phone && (
              <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                <Link href={`tel:${member.phone}`} className="flex items-center gap-2">
                  <Phone className="h-6 w-6" />
                  <span>{member.phone}</span>
                </Link>
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs: teamMembers } = await payload.find({
    collection: 'team',
  })

  return teamMembers.map((member) => ({
    id: member.id,
  }))
}
