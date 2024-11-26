import { getPayload } from 'payload'
import React from 'react'
import config from '@payload-config'
import Image from 'next/image'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { Metadata } from 'next'
export function generateMetadata(): Metadata {
  return {
    title: 'Team | KjG Dossenheim',
  }
}

export default async function Page() {
  const payload = await getPayload({ config })
  const team = await payload.find({
    collection: 'team',
    sort: 'firstName',
    pagination: false,
  })

  return (
    <div>
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-secondary-500 dark:text-primary-500">
            Unser Team
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.docs.map((member)=> (
            <div
              key={member.id}
              className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-secondary-500 dark:border-neutral-700"
            >
              <div className="flex items-center gap-x-4">
                <Avatar className='size-20'>
                  {typeof member.profilePicture === 'object' && member.profilePicture?.url ? (
                    <AvatarImage src={member.profilePicture.url} />
                  ) : (
                    <AvatarFallback>KjG</AvatarFallback>
                  )}
                </Avatar>
                <div className="grow">
                  <h3 className="font-medium text-secondary-500 dark:text-white">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="space-x-2">
                    {member.position.map((position) => (
                      <span
                        key={position}
                        className="inline-block text-xs uppercase font-semibold bg-secondary-500 text-white dark:bg-primary-500 px-2 py-1 rounded-full"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-gray-500 dark:text-white">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
