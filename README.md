# 🎓 The Official New Leets

A modern, feature-rich platform for 42 Network students built with Next.js 15, TypeScript, and PostgreSQL. Features real-time **ranking** by cursus and campus, with a distinctive **pixelated** aesthetic throughout the UI.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📊 Progress Tracking
- **Real-time Rankings**: View student rankings by cursus and campus
- **Level Progression**: Track your level and compare with peers
- **Campus Filtering**: Filter by 30+ global 42 campuses
- **Monthly/Yearly Views**: Switch between pool months and academic years
- **Custom Badges**: VIP, Creator, and Feedback badges system

### 👥 Teams & Collaboration
- **Team Browser**: Explore teams across all projects
- **Project Filtering**: Filter by specific projects or categories
- **Date Filters**: View teams from today, yesterday, or custom dates
- **Member Profiles**: Direct links to 42 intra profiles
- **Advanced Search**: Search by username or project name

### 📝 Evaluations
- **Evaluation History**: Browse all evaluations by date and campus
- **Pass/Fail Filtering**: Quick filters for passed/failed evaluations
- **Score Display**: View detailed scores and feedback
- **Profile Integration**: Quick access to corrector/corrected profiles
- **Real-time Updates**: Live evaluation data from 42 API

### 💼 CV Maker
- **Auto-populated Data**: Automatically fetches your 42 data
- **Project Showcase**: Displays validated projects with scores
- **Skills Display**: Shows your technical skills from cursus
- **Professional Layout**: Clean, print-ready CV format
- **Edit Mode**: Customize your information before exporting
- **PDF Export**: Download your CV with one click


### 📱 Peer Finder
- **Project Matching**: Find peers working on the same project
- **Campus Filtering**: Filter by your campus
- **Auto-refresh**: Automatically updates available peers

### 🔔 Notifications
- **Real-time Alerts**: Instant notifications for important updates
- **User-specific**: Targeted notifications or broadcast to all
- **Mark as Read**: Track which notifications you've seen

### 🎯 Feedback System
- **Rate Peers**: Provide feedback on evaluations
- **Badge System**: Earn badges for quality feedback
- **Categories**: Top Feedback, Innovative, Critical Thinker, Helpful, Contributor

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **ORM**: pg (node-postgres)
- **Authentication**: JWT with jose library
- **API**: 42 Intra API (OAuth 2.0)


### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- 42 API credentials (OAuth app)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Mohammed-Maghri/The-Official-New-Leets.git
cd The-Official-New-Leets
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**

Create a `.env.local` file in the root directory:

```env
# 42 API
INTRA_TOKEN=https://api.intra.42.fr
CLIENT_ID=your_42_client_id
CLIENT_SECRET=your_42_client_secret
REDIRECT_URI=http://localhost:3000/api/auth

# Database
DATABASE_KEY=postgresql://username:password@localhost:5432/database_name

# JWT
SECRET_KEY=your_jwt_secret_key

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Database Setup**

Run the SQL files in `src/app/api/database/`:
```bash
psql -U username -d database_name -f src/app/api/database/chat.sql
psql -U username -d database_name -f src/app/api/database/notifications.sql
psql -U username -d database_name -f src/app/api/database/chat_reactions.sql
# ... etc
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for production**
```bash
npm run build
npm start
```

## 🗂️ Project Structure

```
The-Official-New-Leets/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # Authentication
│   │   │   ├── chat/           # Chat endpoints
│   │   │   ├── evaluations/    # Evaluations data
│   │   │   ├── progress/       # Rankings & progress
│   │   │   ├── slots/          # Teams data
│   │   │   ├── notifications/  # Notifications
│   │   │   └── cv-maker/       # CV generation
│   │   ├── calculator/         # Grade calculator
│   │   ├── chat/              # Chat interface
│   │   ├── cv-maker/          # CV builder UI
│   │   ├── dashboard/         # User dashboard
│   │   ├── evaluations/       # Evaluations browser
│   │   ├── peerfinder/        # Peer finder
│   │   ├── progress/          # Rankings page
│   │   ├── teams/             # Teams browser
│   │   └── vip/               # VIP management
│   ├── component/
│   │   ├── badges/            # Badge components
│   │   ├── context/           # React Context
│   │   ├── dashboard/         # Dashboard components
│   │   ├── feedback/          # Feedback system
│   │   ├── hooks/             # Custom React hooks
│   │   └── navbar/            # Navigation
│   └── utils/
│       ├── moderationUtils.ts # Chat moderation
│       └── rateLimit.ts       # Rate limiting
├── public/                    # Static assets
├── pages/api/                # Pages API (WebSocket)
└── scripts/                  # Utility scripts
```

## 🔐 Authentication Flow

1. User clicks "Login with 42"
2. Redirected to 42 OAuth page
3. User authorizes the app
4. 42 redirects back with authorization code
5. App exchanges code for access token
6. Token encrypted and stored in JWT
7. JWT stored in HTTP-only cookie

## 💾 Caching Strategy

### Profile Pictures (1 hour TTL)
- Shared across all routes
- Batch fetching (50 users/request)
- Reduces API calls by ~50%

### Progress Data (20 minutes TTL)
- Shared globally across users

### Evaluations (20 minutes TTL)
- Graceful degradation on API errors

## 🎨 Design System

- **Pixelated Vibe**: Retro pixel-style UI with chunky borders, pixel fonts, and a nostalgic gaming aesthetic
- **Color Scheme**: Dark theme with blue accents (#0070ef)
- **Typography**: Tektur font for headings, pixel fonts for UI elements
- **Glassmorphism**: Backdrop blur effects throughout
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions with Framer Motion

## 🔧 API Rate Limiting

- **Limit**: 20 requests per minute (1200/hour)
- **Scope**: Per user session
- **Presets**: 
  - STRICT: 20/min
  - MODERATE: 30/min
  - LENIENT: 50/min

## 🐛 Error Handling

- **42 API Downtime**: Graceful fallback to empty results
- **Network Errors**: User-friendly error messages
- **Loading States**: Clear feedback on all async operations

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Author

**Mohammed Maghri** (mmaghri)
- 42 Intra: [@mmaghri](https://profile.intra.42.fr/users/mmaghri)
- GitHub: [@Mohammed-Maghri](https://github.com/Mohammed-Maghri)

## 🙏 Acknowledgments

- 42 Network for the API
- All contributors and testers
- The 42 community

## 📊 Performance Metrics

- **Build Time**: ~11 seconds
- **Initial Load**: < 3 seconds
- **API Response**: < 2 seconds (cached)
- **Capacity**: 109 users/hour with caching
- **Cache Hit Rate**: ~60% average

## 🔮 Roadmap

- [ ] Database caching (Redis)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export data to Excel/CSV

---

Made with ❤️ for the 42 Network community
