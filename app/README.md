# Sermon Video Search Application

A modern, responsive web application built with SvelteKit for searching and discovering sermon content. Features intelligent search through video transcripts, chapter navigation, and an intuitive user interface designed for churches and religious organizations.

## ✨ Features

- **🔍 Smart Search**: Search through full video transcripts and find exact moments
- **📚 Chapter Navigation**: Jump to specific sections with timestamped chapters
- **🎥 Interactive Video Playback**: Synchronized transcripts and chapter markers
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Fast Performance**: Built with SvelteKit for optimal loading speeds
- **🎨 Modern UI**: Clean, accessible design with smooth animations
- **⌨️ Keyboard Shortcuts**: Quick navigation with keyboard shortcuts
- **🌐 SEO Friendly**: Proper meta tags and semantic HTML

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gloo-x-sermonshots/app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 🛠️ Development

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── SearchBar.svelte
│   │   ├── ResultCard.svelte
│   │   ├── ChapterList.svelte
│   │   └── RelatedVideoCard.svelte
│   └── api.ts              # API integration and types
├── routes/
│   └── +page.svelte        # Main application page
├── app.css                 # Global styles and Tailwind config
└── app.html                # HTML template
```

### Key Components

- **SearchBar**: Enhanced search input with loading states and suggestions
- **ResultCard**: Displays video results with chapters and transcripts
- **ChapterList**: Interactive chapter navigation with timestamps
- **RelatedVideoCard**: Shows related content recommendations

### API Integration

The application uses a flexible API structure defined in `src/lib/api.ts`:

```typescript
// Configure your API endpoint
const API_BASE_URL = 'http://localhost:3001/api';

// Main search function
export async function searchVideos(query: string): Promise<SearchResponse>;
```

Currently includes mock data for development. Replace with your actual API endpoints.

## 🎨 Styling

Built with **Tailwind CSS** featuring:

- Custom gradient backgrounds
- Smooth animations and transitions
- Responsive grid layouts
- Accessible focus states
- Custom scrollbars

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search bar
- **Escape**: Clear search results
- **Enter**: Submit search (when in search bar)

## 🔧 Configuration

### Environment Variables

Create a `.env` file for configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### Tailwind Configuration

Customize styling in `tailwind.config.js`:

```javascript
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// Add custom colors, fonts, etc.
		}
	}
};
```

## 📦 Building for Production

1. **Create production build**

   ```bash
   pnpm build
   ```

2. **Preview production build**

   ```bash
   pnpm preview
   ```

3. **Deploy**
   The app is configured with `@sveltejs/adapter-node` for Node.js deployment.

## 🚀 Deployment Options

### Node.js Server

```bash
pnpm build
node build/index.js
```

### Static Site (with adapter-static)

```bash
# Install static adapter
pnpm add -D @sveltejs/adapter-static

# Update svelte.config.js
# Build static site
pnpm build
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "build"]
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

### Linting

```bash
# ESLint
pnpm lint

# Format with Prettier
pnpm format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Ensure responsive design
- Add proper accessibility attributes
- Test on multiple devices/browsers

## 📚 API Documentation

### Search Endpoint

```typescript
GET /api/search?q={query}

Response: {
  query: string;
  totalResults: number;
  results: VideoResult[];
  relatedContent: RelatedVideo[];
}
```

### Video Result Structure

```typescript
interface VideoResult {
	transcription_id: string;
	videoUrl: string;
	text: string;
	chapters: Chapter[];
	title?: string;
	thumbnail?: string;
}

interface Chapter {
	title: string;
	summary: string;
	start: number; // seconds
	end: number; // seconds
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Dependencies issues**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Build errors**
   ```bash
   # Clear SvelteKit cache
   rm -rf .svelte-kit
   pnpm dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Inspired by modern search interfaces

---

For more information, visit the [SvelteKit documentation](https://kit.svelte.dev/docs).
