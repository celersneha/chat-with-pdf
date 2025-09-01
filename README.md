# Chat with PDF

A sophisticated full-stack application that enables users to upload PDF documents and engage in intelligent conversations using AI. Built with Next.js 15, Bun runtime, and powered by Mistral AI with advanced vector search capabilities through Qdrant.

## 🚀 Features

- **PDF Upload & Processing**: Upload and parse PDF documents using pdf-parse
- **AI-Powered Chat**: Ask questions about your PDF content using Mistral AI
- **Conversation Memory**: Maintains chat history and context across sessions with Langgraph
- **Multi-File Context Selection**: Choose and combine context from multiple uploaded PDFs
- **Document Analysis**: Extract and analyze text content from PDFs with advanced chunking
- **Interactive UI**: Modern React interface with Radix UI components and Tailwind CSS
- **Real-time Responses**: Get instant answers based on document content with streaming support
- **Vector Search**: Semantic search across document content using Qdrant embeddings
- **User Authentication**: Secure user management with Clerk authentication
- **Background Processing**: Async document processing with BullMQ job queues

## 🛠️ Technology Stack

### Frontend (Client)

- **Framework**: Next.js 15 with React 19
- **Runtime**: Turbopack for development
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives
- **State Management**: TanStack React Query v5
- **Authentication**: Clerk Next.js integration
- **HTTP Client**: Axios
- **Notifications**: Sonner toast library
- **Icons**: Lucide React
- **Markdown**: Streamdown for rendering

### Backend (Server)

- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Authentication**: Clerk Express middleware
- **Database ORM**: Drizzle ORM with PostgreSQL driver
- **File Upload**: Multer for multipart form handling
- **PDF Processing**: pdf-parse library
- **Job Queue**: BullMQ with Redis (Valkey)
- **CORS**: Express CORS middleware

### AI & Vector Database

- **LLM**: Gemini AI
- **AI Framework**: LangChain with LangGraph for workflow orchestration
- **Vector Database**: Qdrant for semantic search and embeddings
- **Vector Integration**: LangChain Qdrant connector

### Infrastructure

- **Database**: PostgreSQL 17.5 (Alpine)
- **Vector Store**: Qdrant latest
- **Cache/Queue**: Valkey (Redis-compatible)
- **Database Admin**: Adminer web interface
- **Containerization**: Docker & Docker Compose
- **Networking**: Custom bridge network

## 📋 Prerequisites

- **Bun** (latest version for server)
- **Node.js** 18+ (for client)
- **Docker** and **Docker Compose**
- **Mistral AI API Key**
- **Clerk Authentication Keys**

## 🚀 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/chat-with-pdf.git
cd chat-with-pdf
```

2. **Install client dependencies:**

```bash
cd client
npm install
```

3. **Install server dependencies:**

```bash
cd ../server
bun install
```

4. **Set up environment variables:**

```bash
# Root directory
cp .env.example .env

# Configure the following variables:
POSTGRES_DB=chat_with_pdf
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password

# Server environment
MISTRAL_API_KEY=your_mistral_api_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://username:password@localhost:5432/chat_with_pdf
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379
```

5. **Start infrastructure services:**

```bash
docker-compose up -d
```

6. **Initialize database schema:**

```bash
cd server
bun run db:push
```

7. **Start the development servers:**

**Terminal 1 - Backend:**

```bash
cd server
bun run dev
```

**Terminal 2 - Background Worker:**

```bash
cd server
bun run dev:worker
```

**Terminal 3 - Frontend:**

```bash
cd client
npm run dev
```

## 🎯 Usage

1. **Sign Up/Login**: Authenticate using Clerk authentication
2. **Upload PDFs**: Select and upload one or more PDF documents
3. **Document Processing**: Wait for background processing to complete (chunking and vectorization)
4. **Select Context**: Choose which documents to include in your conversation context
5. **Start Chatting**: Ask questions about the document content
6. **Memory Retention**: Continue conversations with full context memory across sessions
7. **Multi-Document Queries**: Ask questions that span across multiple documents
8. **Get AI Responses**: Receive Mistral AI-generated responses based on selected PDF content

## 📁 Project Structure

```
chat-with-pdf/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # Reusable React components
│   │   ├── lib/           # Utility functions and configurations
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Bun backend application
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── services/      # Business logic services
│   │   ├── models/        # Drizzle ORM models
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Server utilities
│   ├── drizzle/           # Database migrations
│   ├── index.ts           # Main server entry point
│   ├── worker.ts          # Background job worker
│   └── package.json       # Backend dependencies
├── docker-compose.yml      # Infrastructure services
├── drizzle.config.ts       # Database configuration
└── README.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables

**Root `.env`:**

```env
POSTGRES_DB=chat_with_pdf
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
```

**Server `.env`:**

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/chat_with_pdf

# External Services
MISTRAL_API_KEY=your_mistral_api_key
QDRANT_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Server Configuration
PORT=3001
NODE_ENV=development
```

**Client `.env.local`:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### Service Ports

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Bun/Express)**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Qdrant**: http://localhost:6333
- **Valkey/Redis**: localhost:6379
- **Adminer**: http://localhost:8080

## 🧪 Testing

```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
bun test
```

## 🏗️ Architecture

### Client-Server Architecture

- **Frontend**: Next.js with React Server Components and client-side hydration
- **Backend**: Express.js API with Bun runtime for high performance
- **Real-time**: Server-sent events for streaming AI responses

### Data Flow

1. **Document Upload**: Multer → PDF parsing → Text chunking → Vector embedding → Qdrant storage
2. **Chat Processing**: User input → Context retrieval → Mistral AI → Response streaming
3. **Memory Management**: Chat history in PostgreSQL + Session cache in Valkey

### Background Processing

- **BullMQ Jobs**: Document processing, embedding generation, cleanup tasks
- **Worker Process**: Separate Bun process for handling background jobs

## 🔒 Security

- **Authentication**: Clerk-based user management with JWT tokens
- **File Upload**: Validated PDF uploads with size and type restrictions
- **Database**: Parameterized queries with Drizzle ORM
- **CORS**: Configured for development and production environments
- **Rate Limiting**: API rate limiting (implementation required)

## 🚀 Deployment

### Production Build

**Client:**

```bash
cd client
npm run build
npm start
```

**Server:**

```bash
cd server
bun run start
```

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mistral AI** for powerful language model capabilities
- **Qdrant** for high-performance vector database
- **LangChain** for AI application framework
- **Clerk** for seamless authentication
- **Bun** for ultra-fast JavaScript runtime
- **Next.js** for React framework excellence
- **Vercel** for deployment platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling

## 📞 Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support
- **Email**: [celersneha@example.com]

## 🐳 Docker Services

After running `docker-compose up -d`, access:

- **Adminer**: http://localhost:8080 (Database management)

  - Server: `postgres`
  - Username: `${POSTGRES_USER}`
  - Password: `${POSTGRES_PASSWORD}`
  - Database: `${POSTGRES_DB}`

- **Qdrant Dashboard**: http://localhost:6333/dashboard (Vector database UI)

## 🔄 Development Workflow

1. **Start Infrastructure**: `docker-compose up -d`
2. **Database Migration**: `cd server && bun run db:push`
3. **Start Backend**: `cd server && bun run dev`
4. **Start Worker**: `cd server && bun run dev:worker`
5. **Start Frontend**: `cd client && npm run dev`
6. **Access Application**: http://localhost:3000

## 📊 Performance

- **Bun Runtime**: Up to 4x faster than Node.js for server operations
- **Turbopack**: Faster development builds with Next.js 15
- **Qdrant**: Sub-millisecond vector search performance
- **Valkey**: High-throughput Redis-compatible caching
- **React 19**: Improved rendering performance with concurrent features
