# Scholar MCP

A lightweight Model Context Protocol (MCP) server for reading and comparing academic papers in PDF format.

Scholar MCP integrates directly with Claude Desktop to streamline literature review workflows by enabling structured PDF ingestion and multi-paper comparison via tool calls.

---

## Motivation

Literature review is repetitive and time-consuming.
This project automates early-stage paper analysis by connecting PDF parsing with AI through MCP.

Instead of manually copying content into chat interfaces, Scholar MCP allows:

* Direct PDF loading
* Abstract extraction
* Multi-paper comparison
* Structured AI-assisted analysis

---

## Features

* **read_pdf** — Extract full text from a PDF file
* **extract_abstract** — Extract the abstract section
* **compare_papers** — Extract and prepare multiple papers for comparison
* **ping** — Test connectivity

---

## Architecture

Claude Desktop
→ MCP Tool Call (JSON-RPC over stdio)
→ Scholar MCP Server
→ PDF Processing
→ Structured Text Response

Key components:

* `@modelcontextprotocol/sdk`
* `pdf-parse`
* Robust error-safe tool handling
* STDIO-based communication

---

## Installation

```bash
git clone https://github.com/mkjun2016/scholar-mcp.git
cd scholar-mcp
npm install
```

---

## Usage

Run locally:

```bash
node server.js
```

Configure in Claude Desktop:

```json
{
  "mcpServers": {
    "scholar-mcp": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/scholar-mcp/server.js"]
    }
  }
}
```

---

## Example Workflow

1. Call `compare_papers` with two PDF paths
2. Ask Claude to:

   * Compare research problems
   * Summarize methodological differences
   * Identify key contributions
   * Highlight research gaps

This enables rapid AI-assisted literature comparison.

---

## Technical Notes

* Uses JSON-RPC over stdio (MCP protocol)
* Avoids stdout logging to maintain protocol integrity
* Handles environment isolation issues (e.g., nvm vs GUI apps)
* Implements safe error handling to prevent server disconnects

---

## License

ISC