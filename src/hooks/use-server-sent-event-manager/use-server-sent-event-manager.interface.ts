export declare namespace IUseServerSentEventManager {
  export interface ListenerItem {
    eventName: string;
    listener: (event: MessageEvent) => void;
  }

  export interface SseInfo {
    connectUrl: string;
    disconnectUrl?: string;
    eventSource: EventSource;
    listenerItems: ListenerItem[];
  }

  export interface Props {

  }
}