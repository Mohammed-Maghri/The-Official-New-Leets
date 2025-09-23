
# 1337leets

> Elite School Ranking & Dashboard Platform

1337leets is a modern web application for 1337/42 students, providing a personalized dashboard, elite school ranking, VIP project explorer, and more. Built with Next.js, React, and Tailwind CSS, it offers a beautiful, responsive, and interactive user experience.

## Features

- **Landing Page**: Modern, animated welcome with quick access to login, old version, and GitHub links.
- **Authentication**: OAuth2-based login with secure JWT cookies.
- **Dashboard**: View your rank, wallet, correction points, pool/campus info, and contact details in a rich UI.
- **VIP Area**: Explore teams, projects, and advanced filters (VIP access required).
- **Project Explorer**: Filter and analyze projects by campus, difficulty, and more.
- **Classic Mode**: Access the old interface for nostalgia.
- **Admin Panel**: Special admin features for privileged users.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MUI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Emotion](https://emotion.sh/docs/introduction)
- [Three.js](https://threejs.org/) & [OGL](https://oframe.github.io/ogl/)
- [PostgreSQL](https://www.postgresql.org/) (backend)

## Getting Started

1. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```

2. **Set up environment variables:**
	- Copy `.env.example` to `.env.local` and fill in required values (OAuth, DB, etc).

3. **Run the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	```
	Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `dev` – Start the development server
- `build` – Build for production
- `start` – Start the production server
- `lint` – Run ESLint

## Project Structure

- `src/app/` – App routes (dashboard, VIP, API, etc)
- `src/component/` – Reusable UI components
- `public/` – Static assets (images, JSON, etc)
- `apiText/` – (Custom API text or docs)

## Contributing

Pull requests and issues are welcome! Please star the repo if you find it useful.

## License

MIT © [Mohammed Maghri](https://github.com/Mohammed-Maghri)
