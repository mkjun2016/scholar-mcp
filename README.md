# Scholar MCP

A Model Context Protocol (MCP) server for reading and analyzing academic papers in PDF format.

## Features

- **Read PDF**: Extract and read full text content from PDF files
- **Extract Abstract**: Automatically extract the abstract section from academic papers
- **Test Tool**: Ping tool for testing server connectivity

## Installation

Clone the repository:

```bash
git clone https://github.com/mkjun2016/scholar-mcp.git
cd scholar-mcp
```

Install dependencies:

```bash
npm install
```

## Usage

This MCP server communicates via stdio and is designed to be used with MCP clients like Claude Desktop.

### Running the Server

```bash
node server.js
```

### Available Tools

#### `read_pdf`
Reads the full text content of a PDF file.

**Parameters:**
- `path` (string, required): Path to the PDF file

#### `extract_abstract`
Extracts the abstract section from an academic paper.

**Parameters:**
- `path` (string, required): Path to the PDF file

#### `ping`
Test tool to verify server connectivity.

## MCP Client Configuration

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "scholar-mcp": {
      "command": "node",
      "args": ["/path/to/scholar-mcp/server.js"]
    }
  }
}
```

## Dependencies

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP SDK
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF text extraction
