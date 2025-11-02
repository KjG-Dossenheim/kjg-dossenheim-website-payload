# KjG Dossenheim Website (Payload CMS)

This is the source code for the KjG Dossenheim website, built with Next.js and Payload CMS. It provides content management, event registration, and information for the KjG Dossenheim community.

## Features

- Content management with Payload CMS
- Event registration and management
- Blog and news posts
- Team and membership management
- Custom UI components

## Setup

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (recommended)
- MongoDB (local or remote)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory and configure your MongoDB connection and other secrets as needed.

### Running Locally

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

## Usage

- Access the admin panel at `/admin` for content management.
- Website pages are available under `/` and subroutes (see folder structure below).

## Database & Storage

- **Database**: MongoDB
- **Storage Adapter**: localDisk

## Folder Structure

```
src/
	payload-types.ts
	payload.config.ts
	app/
		(payload)/
			custom.scss
			layout.tsx
			admin/
			api/
		(website)/
			layout.tsx
			not-found.tsx
			page.tsx
			...
	blocks/
		cover/
		gallery/
		image/
		videoPlayer/
	collections/
		blogCategory.ts
		Jahresplan.ts
		Media.ts
		Team.ts
		...
	components/
		Aurora.tsx
		Silk.jsx
		admin/
		common/
		email/
		layout/
		ui/
		utils/
		wed/
	fields/
	globals/
	graphics/
	lib/
	styles/
	utilities/
public/
	robots.txt
	sitemap.xml
```

## License

See `LICENSE` for details.
