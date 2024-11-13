import { getPayloadHMR } from '@payloadcms/next/utilities'
import React from 'react'
import config from '@payload-config'
import Image from 'next/image'

export default async function Page() {
  const payload = await getPayloadHMR({ config })
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
          {team.docs.map((member) => (
            <div
              key={member.id}
              className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700"
            >
              <div className="flex items-center gap-x-4">
                {typeof member.profilePicture !== 'string' && member.profilePicture ? (
                  <Image
                    src={member.profilePicture.url || ''}
                    alt={member.profilePicture.alt || ''}
                    width={320}
                    height={320}
                    className="rounded-full size-20"
                  />
                ) : (
                  <Image
                    src="/api/teambilder/file/undraw_Pic_profile_re_7g2h.png"
                    alt="Default profile picture"
                    width={320}
                    height={320}
                    className="rounded-full size-20"
                  />
                )}
                <div className="grow">
                  <h3 className="font-medium text-secondary-500 dark:text-primary-500">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="space-x-2">
                    {member.position.map((position) => (
                      <span
                        key={position}
                        className="inline-block text-xs uppercase font-semibold bg-secondary-500 text-white dark:bg-neutral-800 dark:text-neutral-400 px-2 py-1 rounded-full"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-gray-500 dark:text-neutral-500">{member.description}</p>
            </div>
          ))}
          <a
            className="col-span-full lg:col-span-1 group flex flex-col justify-center text-center rounded-xl p-4 md:p-6 border border-dashed border-gray-200 hover:shadow-sm focus:outline-none focus:shadow-sm dark:border-neutral-700"
            href="#"
          >
            <h3 className="text-lg text-gray-800 dark:text-neutral-200">Lust, mitzumachen?</h3>
            <div>
              <span className="inline-flex items-center gap-x-2 text-blue-600 group-hover:text-blue-700 group-focus:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-400 dark:group-focus:text-blue-400">
                Jetzt Mitglied werden
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
