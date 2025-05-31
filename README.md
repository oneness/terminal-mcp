## Terminal MCP
```
src
├── chat.ts   # terminal chat interface to Claude completion
├── client.ts # MCP client that starts MCP server with stdio transport
├── index.ts  # Node run script to start MCP server or Chat CLI
├── llm.ts    # Uses Anthropic SDK to talk to Claude API
└── server.ts # MCP server that exposes tools and executes them
```

## Depends
```
NPM                  # install with your package manager of choice (Recommend nix)
                     # nix shell nixpkgs#nodejs
ANTHROPIC_API_KEY='' # Put your key here in .env.local file
```

## Build

```
npm run build
```

##  Run CLI chat with Anthropic using Terminal MCP
```
npm run chat
```

## TODO
- [ ] Refactor to make it to use plugins
- [ ] Add coding agent capabilities

