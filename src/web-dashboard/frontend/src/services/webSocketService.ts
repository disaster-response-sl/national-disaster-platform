import { toast } from 'react-hot-toast';

interface WebSocketMessage {
  type: 'report_update' | 'disaster_update' | 'resource_update' | 'statistics_update';
  data: any;
  timestamp: string;
}

interface WebSocketCallbacks {
  onReportUpdate?: (data: any) => void;
  onDisasterUpdate?: (data: any) => void;
  onResourceUpdate?: (data: any) => void;
  onStatisticsUpdate?: (data: any) => void;
  onConnectionChange?: (connected: boolean) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(callbacks: WebSocketCallbacks): void {
    this.callbacks = callbacks;
    
    try {
      // Use environment variable or fallback to localhost
      const wsUrl = this.url || 'ws://localhost:5000/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.callbacks.onConnectionChange?.(true);
    this.startHeartbeat();
    
    toast.success('Real-time updates connected', {
      icon: '🔄',
      duration: 2000,
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'report_update':
          this.callbacks.onReportUpdate?.(message.data);
          toast.success('New report received', {
            icon: '📍',
            duration: 3000,
          });
          break;
          
        case 'disaster_update':
          this.callbacks.onDisasterUpdate?.(message.data);
          toast.success('Disaster status updated', {
            icon: '⚠️',
            duration: 3000,
          });
          break;
          
        case 'resource_update':
          this.callbacks.onResourceUpdate?.(message.data);
          toast.success('Resource data updated', {
            icon: '📦',
            duration: 3000,
          });
          break;
          
        case 'statistics_update':
          this.callbacks.onStatisticsUpdate?.(message.data);
          break;
          
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(): void {
    console.log('WebSocket disconnected');
    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);
    this.stopHeartbeat();
    this.scheduleReconnect();
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    toast.error('Real-time connection error', {
      icon: '⚠️',
      duration: 3000,
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.callbacks);
      }, this.reconnectInterval);
    } else {
      toast.error('Failed to establish real-time connection', {
        icon: '❌',
        duration: 5000,
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService(
  process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws'
);

export default webSocketService;
