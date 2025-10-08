# Sermon Search API

A powerful NestJS-based API that provides intelligent sermon search capabilities using vector embeddings, AI analysis, and chapter-based navigation. This API processes sermon videos, transcribes them using AssemblyAI, stores embeddings in ChromaDB, and provides AI-enhanced search results using OpenAI.

## 🚀 Features

### Core Functionality

- **Video Transcription**: Automatic transcription using AssemblyAI with chapter detection
- **Vector Search**: Semantic search through sermon content using ChromaDB embeddings
- **AI Analysis**: OpenAI GPT-4o-mini integration for intelligent question-answering
- **Chapter Navigation**: Detailed chapter breakdown with relevance scoring
- **Background Processing**: Queue-based video processing with BullMQ

### Search Capabilities

- **Semantic Search**: Find sermons based on meaning, not just keywords
- **Chapter-Level Relevance**: Identify specific sermon sections that answer questions
- **AI-Enhanced Results**: Determine if sermons actually answer user questions
- **Confidence Scoring**: AI confidence ratings for search relevance
- **Relevant Excerpts**: Extract key passages that address user queries

## 🏗️ Architecture

### Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL for metadata storage
- **Vector Database**: ChromaDB for embeddings and semantic search
- **Queue System**: BullMQ with Redis for background processing
- **AI Services**:
  - AssemblyAI for transcription and chapter detection
  - OpenAI GPT-4o-mini for intelligent analysis
- **ORM**: TypeORM for database operations

### Key Components

#### Services

- **VideoService**: Core video processing and search functionality
- **AssemblyaiService**: Video transcription and chapter detection
- **ChromaService**: Vector embeddings and semantic search
- **OpenaiService**: AI analysis and question-answering

#### Data Flow

1. **Video Ingestion**: Videos are queued for processing
2. **Transcription**: AssemblyAI processes audio and generates chapters
3. **Embedding**: Transcripts and chapters are embedded in ChromaDB
4. **Search**: Vector search finds relevant content
5. **AI Analysis**: OpenAI analyzes results for question relevance
6. **Response**: Enhanced results with AI insights returned

## 🛠️ Development Setup

### Prerequisites

- Node.js 20.19+ or 22.12+
- Docker and Docker Compose
- pnpm package manager

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.sample .env
   ```

   Fill in the required environment variables:

   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5434
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=sermonseek

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # ChromaDB Configuration
   CHROMADB_HOST=http://localhost
   CHROMADB_PORT=8000

   # API Keys
   ASSEMBLYAI_API_KEY=your_assemblyai_key_here
   OPENAI_API_KEY=your_openai_key_here

   ```

3. **Start Infrastructure**

   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL database (port 5434)
   - ChromaDB instance (port 8000)
   - Redis for queue management (port 6379)

4. **Database Setup**

   ```bash
   pnpm db:migrate
   ```

5. **Start Development Server**

   ```bash
   pnpm start:dev
   ```

   The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Video Processing

#### `POST /video/transcribe`

Starts transcription process for videos from CSV data.

- Queues videos for background processing
- Returns processing status

#### `GET /video/search`

Performs intelligent search across sermon content.

**Query Parameters:**

- `q` (string): Search query or question

**Response:**

```json
{
  "query": "How do I find purpose in life?",
  "totalResults": 3,
  "aiEnhanced": true,
  "results": [
    {
      "transcription_id": "abc123",
      "title": "Finding Your Purpose",
      "videoUrl": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "chapters": [
        {
          "title": "Introduction to Purpose",
          "summary": "Overview of finding life purpose",
          "start": 0,
          "end": 30000,
          "isRelevant": true,
          "relevanceScore": 0.95
        }
      ],
      "aiAnalysis": {
        "answersQuestion": true,
        "confidence": 85,
        "bestAnswer": "Purpose comes from aligning your gifts with God's calling",
        "relevantExcerpts": [
          "God has uniquely gifted each person...",
          "Your purpose is found in serving others..."
        ],
        "reasoning": "This sermon directly addresses finding life purpose through biblical principles"
      }
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

| Variable             | Description           | Required |
| -------------------- | --------------------- | -------- |
| `DATABASE_HOST`      | PostgreSQL host       | Yes      |
| `DATABASE_PORT`      | PostgreSQL port       | Yes      |
| `DATABASE_USERNAME`  | Database username     | Yes      |
| `DATABASE_PASSWORD`  | Database password     | Yes      |
| `DATABASE_NAME`      | Database name         | Yes      |
| `REDIS_HOST`         | Redis host for queues | Yes      |
| `REDIS_PORT`         | Redis port            | Yes      |
| `CHROMADB_HOST`      | ChromaDB host URL     | Yes      |
| `CHROMADB_PORT`      | ChromaDB port         | Yes      |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key    | Yes      |
| `OPENAI_API_KEY`     | OpenAI API key        | Yes      |

### AI Configuration

#### OpenAI Settings

- **Model**: GPT-4o-mini (cost-effective, fast)
- **Temperature**: 0.3 (focused responses)
- **Max Tokens**: 1000
- **Batch Size**: 3 (concurrent analysis limit)

#### AssemblyAI Features

- Auto-chapters detection
- Speaker diarization
- Word-level timestamps
- Summary generation

## 🧪 Testing

### Manual Testing

#### Test Video Transcription

```bash
./scripts/transcribevideos.sh <accessToken> <page> <limit>
```

#### Test Search Functionality

```bash
curl "http://localhost:3001/video/search?q=How%20to%20find%20peace"
```

### Development Commands

```bash
# Start development server
pnpm start:dev

# Build for production
pnpm build

# Run production server
pnpm start:prod

# Database migrations
pnpm db:migrate

# Generate migration
pnpm db:migration:generate

# Reset database
pnpm db:reset
```

## 🚦 Monitoring & Debugging

### Queue Management

- BullMQ dashboard available for monitoring background jobs
- Failed jobs are automatically retried with exponential backoff
- Queue metrics available through Redis

### Logging

- Structured logging with different levels (debug, info, warn, error)
- Request/response logging for API calls
- Service-specific loggers for debugging

### Health Checks

- Database connectivity
- ChromaDB availability
- Redis connection status
- External API health

## 🔒 Security Considerations

- API keys stored in environment variables
- Database credentials secured
- CORS configured for frontend integration
- Input validation on all endpoints
- Rate limiting on search endpoints

## 📈 Performance

### Optimization Features

- Vector search indexing in ChromaDB
- Database query optimization with TypeORM
- Background processing for heavy operations
- Caching strategies for frequent queries
- Batch processing for AI analysis

### Scaling Considerations

- Horizontal scaling with multiple API instances
- Queue workers can be scaled independently
- ChromaDB supports distributed deployments
- Database connection pooling configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
