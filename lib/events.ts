'use client';

type Callback = (data?: any) => void;

class EventBus {
  private events: Record<string, Callback[]> = {};

  on(event: string, callback: Callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  DATA_CHANGED: 'DATA_CHANGED',
  NAVIGATE_FORM: 'NAVIGATE_FORM',
  REFRESH_GRID: 'REFRESH_GRID',
  REFRESH_GRID_DATA: 'REFRESH_GRID_DATA',
};
