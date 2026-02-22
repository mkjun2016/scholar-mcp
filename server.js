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
        name: "update_analysis_policy",
        description: "Update analysis configuration policy",
        inputSchema: {
          type: "object",
          properties: {
            max_tokens: { type: "number" },
            enable_chunking: { type: "boolean" },
            dry_run: { type: "boolean" },
          },
          required: ["dry_run"],
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
      {
        name: "compare_papers",
        description:
          "Extract abstracts (or first pages) from multiple PDFs for comparison",
        inputSchema: {
          type: "object",
          properties: {
            paths: { type: "array", items: { type: "string" }, minItems: 2 },
          },
          required: ["paths"],
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

    // Compare Papers
    if (name === "compare_papers") {
      const pathsArr = args.paths;

      const results = [];
      for (const p of pathsArr) {
        const filePath = path.resolve(p);

        if (!fs.existsSync(filePath)) {
          results.push(`---\nFILE: ${filePath}\nERROR: File not found.\n`);
          continue;
        }

        const buffer = fs.readFileSync(filePath);
        const data = await pdf(buffer);
        const text = data.text || "";

        const match = text.match(/abstract([\s\S]*?)(introduction|1\.)/i);
        const abstract = match ? match[1].trim() : "";

        const snippet =
          abstract.length > 80 ? abstract : text.slice(0, 2500).trim();

        results.push(`---\nFILE: ${filePath}\nEXTRACT:\n${snippet}\n`);
      }

      return {
        content: [
          {
            type: "text",
            text: results.join("\n"),
          },
        ],
      };
    }

    // Update Analysis Policy (Dry-run supported)
    if (name === "update_analysis_policy") {
      const { max_tokens, enable_chunking, dry_run } = args;

      if (dry_run) {
        return {
          content: [
            {
              type: "text",
              text: `
Simulation Mode:
- max_tokens would be set to ${max_tokens}
- enable_chunking would be set to ${enable_chunking}
No changes were applied.
        `,
            },
          ],
        };
      }

      global.analysisPolicy = {
        max_tokens,
        enable_chunking,
      };

      return {
        content: [
          {
            type: "text",
            text: "Policy updated successfully.",
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
