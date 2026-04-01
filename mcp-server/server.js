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

// ---------- TOOLS ----------

const tools = [
  {
    name: 'start_session',
    description: 'Start a new VibeTrack coding session to track AI usage',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID' },
        source: { type: 'string', description: 'Source: web, desktop, chrome, mcp', default: 'mcp' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'end_session',
    description: 'End an active VibeTrack session and calculate vibe score',
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
    description: 'Log a prompt, break, or activity event during a coding session',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'number', description: 'Session ID' },
        user_id: { type: 'number', description: 'User ID' },
        event_type: { type: 'string', enum: ['prompt', 'break', 'activity'], description: 'Event type' },
        source: { type: 'string', description: 'Event source', default: 'mcp' },
        content: { type: 'string', description: 'Event content (prompt text, break reason, etc.)' },
      },
      required: ['session_id', 'user_id', 'event_type'],
    },
  },
  {
    name: 'get_stats',
    description: 'Get aggregate statistics: total sessions, prompts, vibe scores, classifications',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional, omit for all users)' },
      },
    },
  },
  {
    name: 'get_sessions',
    description: 'Get list of all tracked coding sessions',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional)' },
      },
    },
  },
  {
    name: 'get_ml_patterns',
    description: 'Get ML-powered productivity patterns: peak hours, dependency trends, break habits',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID (optional)' },
      },
    },
  },
  {
    name: 'calculate_vibe_score',
    description: 'Calculate vibe score for a completed session. Formula: (duration * prompts) / (breaks + 1)',
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
    description: 'Get personalized recommendations based on coding behavior analysis',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'number', description: 'User ID' },
      },
    },
  },
  {
    name: 'predict_session',
    description: 'Predict the outcome of a coding session given duration, prompts, and breaks',
    inputSchema: {
      type: 'object',
      properties: {
        duration: { type: 'number', description: 'Expected duration in minutes' },
        prompt_count: { type: 'number', description: 'Expected number of prompts' },
        break_minutes: { type: 'number', description: 'Expected break time in minutes' },
      },
      required: ['duration', 'prompt_count', 'break_minutes'],
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
        await axios.post(`${API_BASE}/api/session/end/${args.session_id}`);
        const response = await axios.post(`${API_BASE}/api/session/calculate-vibe/${args.session_id}`);
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
        const url = `${API_BASE}/api/recommendations${args.user_id ? `?user_id=${args.user_id}` : ''}`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'predict_session': {
        const url = `${API_BASE}/api/ml/predict?duration=${args.duration}&prompt_count=${args.prompt_count}&break_minutes=${args.break_minutes}`;
        const response = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    return {
      content: [{ type: 'text', text: `Error: ${msg}` }],
      isError: true,
    };
  }
});

// ---------- RESOURCES ----------

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'vibetrack://stats',
        name: 'VibeTrack Statistics',
        description: 'Current aggregate statistics from VibeTrack',
        mimeType: 'application/json',
      },
      {
        uri: 'vibetrack://sessions',
        name: 'Recent Sessions',
        description: 'List of recent coding sessions with vibe scores',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === 'vibetrack://stats') {
      const response = await axios.get(`${API_BASE}/api/stats`);
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(response.data, null, 2),
        }],
      };
    }

    if (uri === 'vibetrack://sessions') {
      const response = await axios.get(`${API_BASE}/api/sessions`);
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(response.data, null, 2),
        }],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    throw new Error(`Failed to read resource: ${error.message}`);
  }
});

// ---------- START ----------

const transport = new StdioServerTransport();
await server.connect(transport);
