# EcoKind

EcoKind is a decentralized, privacy-focused platform for safe and respectful online communication. Built on the Internet Computer (IC) using Motoko and React, EcoKind provides robust moderation tools, harassment detection, and a developer-friendly API for integrating content moderation into your own projects.

## Features

- **Decentralized Messaging:** Send and receive messages securely on the Internet Computer.
- **Harassment Detection:** Uses LLMs to detect and block harassing or offensive content in real time.
- **Severity Classification:** Classifies the severity of detected harassment (Low, Moderate, High).
- **Message Improvement:** Suggests improved, non-offensive versions of flagged messages.
- **API Key Management:** Developers can generate and manage API keys for their projects.
- **Frontend Dashboard:** Modern React-based dashboard for users and developers.
- **SDK for Integration:** Easily integrate EcoKind's moderation features into your own apps using the published npm package.

## Live Demo

Visit the live platform: [https://ecokind.xyz](https://ecokind.xyz)

## NPM Package

We provide an npm package for easy integration of EcoKind's moderation features into your own JavaScript/TypeScript projects.

- **Package:** [ecokind-moderation-sdk](https://www.npmjs.com/package/ecokind-moderation-sdk)
- **Install:**  
  ```bash
  npm install ecokind-moderation-sdk
  ```
- **Usage Example:**
  ```js
  import { moderateMessage } from 'ecokind-moderation-sdk';

  const result = await moderateMessage("Your message here");
  if (result.flagged) {
    console.log("Message flagged:", result.reason);
  }
  ```

## Project Structure

- `src/EcoKind_backend/`: Motoko canister code (core logic, moderation, messaging, API keys)
- `src/EcoKind_frontend/`: React frontend (dashboard, user interface)
- `test/`: Motoko test files

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 7
- [DFINITY SDK](https://smartcontracts.org/docs/quickstart/quickstart-intro.html)
- [mops](https://mops.one/) (Motoko package manager)

### Install Dependencies

```bash
npm install
cd src/EcoKind_frontend
npm install
```

### Local Development

#### Start the Internet Computer Local Replica

```bash
dfx start --background
```

#### Deploy Canisters

```bash
dfx deploy
```

#### Start the Frontend

```bash
cd src/EcoKind_frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Running Tests

#### Motoko Tests

```bash
cd EcoKind
mops test
```

#### Frontend Tests

If you add frontend tests, run them with your preferred framework (e.g., Jest, Vitest).

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/ushi86/EcoKind).

## License

MIT
