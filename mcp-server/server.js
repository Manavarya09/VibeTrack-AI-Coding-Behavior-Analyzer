import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_BASE = process.env.VIBETRACK_API_URL || 'http://localhost:8000';

const server = new Server(
  {
    name: 'vibetrack',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

const tools = [
  {
    name: 'start_session',
    description: 'Start a new VibeTrack coding session',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID' },
        source: { type: 'string', description: 'Source (web, desktop, chrome)' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'end_session',
    description: 'End an active VibeTrack session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'number', description: 'Session ID to end' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'log_event',
    description: 'Log an event during a session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'number', description: 'Session ID' },
        user_id: { type: 'number', description: 'User ID' },
        event_type: { type: 'string', description: 'Event type (prompt, break, activity)' },
        source: { type: 'string', description: 'Source (web, desktop, chrome)' },
        content: { type: 'string', description: 'Event content' },
      },
      required: ['session_id', 'user_id', 'event_type'],
    },
  },
  {
    name: 'get_stats',
    description: 'Get aggregate statistics',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional)' },
      },
    },
  },
  {
    name: 'get_sessions',
    description: 'Get all sessions',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional)' },
      },
    },
  },
  {
    name: 'get_ml_patterns',
    description: 'Get ML-powered productivity patterns',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional)' },
      },
    },
  },
  {
    name: 'calculate_vibe_score',
    description: 'Calculate vibe score for a session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'number', description: 'Session ID' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'get_recommendations',
    description: 'Get personalized recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID' },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'start_session': {
        const response = await axios.post(`${API_BASE}/api/session/start`, {
          user_id: args.user_id,
          source: args.source || 'mcp',
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'end_session': {
        const response = await axios.post(`${API_BASE}/api/session/end/${args.session_id}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'log_event': {
        const response = await axios.post(`${API_BASE}/api/event`, {
          session_id: args.session_id,
          user_id: args.user_id,
          event_type: args.event_type,
          source: args.source || 'mcp',
          content: args.content,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_stats': {
        const url = args.user_id 
          ? `${API_BASE}/api/stats?user_id=${args.user_id}`
          : `${API_BASE}/api/stats`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_sessions': {
        const url = args.user_id 
          ? `${API_BASE}/api/sessions?user_id=${args.user_id}`
          : `${API_BASE}/api/sessions`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_ml_patterns': {
        const url = args.user_id 
          ? `${API_BASE}/api/ml/patterns?user_id=${args.user_id}`
          : `${API_BASE}/api/ml/patterns`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'calculate_vibe_score': {
        const response = await axios.post(`${API_BASE}/api/session/calculate-vibe/${args.session_id}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_recommendations': {
        const url = `${API_BASE}/api/recommendations?user_id=${args.user_id}`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [] };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new Error('Resources not implemented');
});

const transport = new StdioServerTransport();
await server.connect(transport);
