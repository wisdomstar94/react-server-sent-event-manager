export declare namespace IUseServerSentEventManager {
  export type SseListener = (event: MessageEvent) => void;

  export interface SubscriberInfo {
    connectUrl: string;
    eventName: string;
    listener: SseListener;
  }

  export interface PureListenerInfo {
    eventName: string;
    listener: SseListener;
  }

  export interface SseInfo {
    connectUrl: string;
    disconnectUrl?: string;
    eventSource: EventSource;
  }

  export interface Props {
    onConnectSuccessSseInfo?: (sseInfo: SseInfo) => void;
  }
}