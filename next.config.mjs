import { withPayload } from '@payloadcms/next/withPayload'
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.netlify.com',
      },
    ],
  },
}

export default withFlowbiteReact(withPayload(nextConfig))