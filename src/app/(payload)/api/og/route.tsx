import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const postTitle = searchParams.get('title')
  const postAuthor = searchParams.get('author')
  const postPublishedDate = searchParams.get('publishedDate')

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center bg-cyan-500">
        <h1 tw="text-9xl">{postTitle}</h1>
        <h2 tw="text-4xl">{postAuthor}</h2>
        <p tw="text-lg">{postPublishedDate}</p>
      </div>
    ),
    {
      width: 1200,
      height: 620,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  )
}
