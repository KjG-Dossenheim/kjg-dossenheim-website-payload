import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const postTitle = searchParams.get('title')

  const font = fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/geist-mono@latest/latin-400-normal.ttf',
  ).then((res) => res.arrayBuffer())
  const fontData = await font

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center bg-cyan-500">
        <h1 tw="text-5xl">{postTitle}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 620,
      fonts: [
        {
          name: 'Geist Mono',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  )
}
