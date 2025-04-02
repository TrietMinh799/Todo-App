# Todo App

A beautiful and modern todo application built with React, Electron, and TailwindCSS.

## Features

- 🎨 Beautiful and modern UI with dark mode support
- 📱 Cross-platform desktop application
- ⚡ Fast and responsive
- 💾 Local storage persistence
- 🏷️ Categories and priority levels
- 📅 Due dates
- 🔍 Search and filter functionality
- ✏️ Edit functionality
- 📝 Subtasks support

## Development

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime & package manager)
- [Node.js](https://nodejs.org/) (for Electron)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-github-username/todo-app.git
cd todo-app
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run electron:dev
```

## Building

### Local Build

To build the application locally:

```bash
bun run electron:build
```

The built applications will be available in the `release` directory.

### Automated Builds

The application is automatically built and packaged for Windows, macOS, and Linux using GitHub Actions when:

- A pull request is created or updated
- Changes are pushed to the main branch
- A new release is published

To create a new release:

1. Create a new release on GitHub
2. The workflow will automatically build and package the application
3. The built applications will be attached to the release

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
