# Local Discord

A local-only Discord clone built with React + TypeScript + Electron. No backend server required - everything runs locally with localStorage persistence.

![Local Discord Screenshot](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Electron](https://img.shields.io/badge/Electron-Ready-green)

## Features

### Core Features
- **Discord-style UI** - Familiar 3-column layout (servers | channels | messages)
- **Server/Channel/Message CRUD** - Create, edit, delete servers, channels, and messages
- **Offline-first** - Works completely offline with localStorage persistence
- **Data Export/Import** - Backup and restore your data as JSON

### Knowledge Base Features (Obsidian-style)
- **#Tag System** - Auto-parse tags from messages, click to filter
- **Tag Cloud** - Visual tag overview in sidebar with usage counts
- **Message Pinning** - Pin important messages to channel top
- **Message Bookmarking** - Star messages for quick access across all channels

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Open search |
| `Ctrl+B` | Open bookmarks panel |
| `Ctrl+,` | Open settings |

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop**: Electron
- **State Management**: Zustand
- **Storage**: localStorage (no database required)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TechieQuokka/local-discord.git
cd local-discord

# Install dependencies
npm install

# Run in development mode (browser)
npm run dev

# Run as Electron app
npm run electron:dev
```

### Build

```bash
# Build for production
npm run build

# Build Electron app
npm run electron:build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ServerList.tsx   # Server sidebar
│   ├── ChannelList.tsx  # Channel list + Tag cloud
│   ├── MessageArea.tsx  # Message display area
│   ├── MessageInput.tsx # Message input box
│   ├── SearchModal.tsx  # Search functionality
│   ├── BookmarkPanel.tsx # Bookmarks panel
│   ├── TagCloud.tsx     # Tag cloud component
│   └── SettingsPanel.tsx # Settings & export/import
├── store/
│   └── index.ts         # Zustand store (state management)
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   ├── storage.ts       # localStorage utilities
│   └── tags.ts          # Tag parsing utilities
└── App.tsx              # Main app component
```

## Usage

### Creating Content
1. Click `+` in the server list to create a new server
2. Click `+` next to "텍스트 채널" to create a channel
3. Type messages in the input box at the bottom

### Using Tags
- Type `#tagname` in your message to create a tag
- Tags are automatically highlighted and clickable
- Click a tag to filter messages by that tag
- Use the tag cloud in the sidebar for quick filtering

### Pinning & Bookmarking
- **Right-click** any message to access the context menu
- Select "📌 채널에 고정" to pin (shows at channel top)
- Select "⭐ 북마크 추가" to bookmark (access via `Ctrl+B`)

### Data Management
- Open Settings (`Ctrl+,`) to export/import data
- Data is stored in browser's localStorage
- Export creates a JSON backup file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- UI inspired by [Discord](https://discord.com)
- Knowledge base features inspired by [Obsidian](https://obsidian.md)
- Built with [Claude Code](https://claude.ai)
