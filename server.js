import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const server = new Server(
  {
    name: "paper-reader",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ping",
        description: "Test tool",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "read_pdf",
        description: "Read full text of a PDF file",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
          },
          required: ["path"],
        },
      },
      {
        name: "extract_abstract",
        description: "Extract abstract section from PDF",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
          },
          required: ["path"],
        },
      },
    ],
  };
});

// Tool Execution Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Test
    if (name === "ping") {
      return {
        content: [{ type: "text", text: "pong" }],
      };
    }

    // Read PDF
    if (name === "read_pdf") {
      const filePath = path.resolve(args.path);

      if (!fs.existsSync(filePath)) {
        return {
          content: [{ type: "text", text: "File not found." }],
        };
      }

      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);

      return {
        content: [
          {
            type: "text",
            text: data.text.slice(0, 15000),
          },
        ],
      };
    }

    // Abstract Extraction
    if (name === "extract_abstract") {
      const filePath = path.resolve(args.path);

      if (!fs.existsSync(filePath)) {
        return {
          content: [{ type: "text", text: "File not found." }],
        };
      }

      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);

      const match = data.text.match(/abstract([\s\S]*?)(introduction|1\.)/i);

      return {
        content: [
          {
            type: "text",
            text: match ? match[1].trim() : "Abstract not found",
          },
        ],
      };
    }

    // Unknown tool error
    return {
      content: [{ type: "text", text: "Unknown tool requested." }],
    };
  } catch (err) {
    console.error("Tool execution error:", err);

    return {
      content: [
        {
          type: "text",
          text: "Internal server error.",
        },
      ],
    };
  }
});

// Start Server with debug
const transport = new StdioServerTransport();

async function main() {
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
});
