import { useCallback, useEffect, useRef, useState } from "react";
import { IUseServerSentEventManager } from "./use-server-sent-event-manager.interface";
import axios from "axios";

const seperatorChar = `__@@@__`;

export function useServerSentEventManager(props?: IUseServerSentEventManager.Props) {
  const {
    onConnectSuccessSseInfo,
  } = props ?? {};

  const sseInfos = useRef<IUseServerSentEventManager.SseInfo[]>([]); 
  const sseSubscriberInfos = useRef<Map<string, IUseServerSentEventManager.SubscriberInfo>>(new Map());
  const ssePureListenerInfos = useRef<Map<string, IUseServerSentEventManager.PureListenerInfo>>(new Map());
  // const [recentUpdatedAt, setRecentUpdatedAt] = useState({ createdAt: 0 });

  // const tryConnectTimeout = useRef<NodeJS.Timeout>();
  // const removeSse = useCallback((connectUrl: string): void => {
  //   sseInfos.current = sseInfos.current.filter(x => x.connectUrl !== connectUrl);
  //   // setRecentUpdatedAt({ createdAt: Date.now() });
  // }, []);

  const getSse = useCallback((connectUrl: string): IUseServerSentEventManager.SseInfo | undefined => {
    return sseInfos.current.find(x => x.connectUrl === connectUrl);
  }, []);

  const isAlreadyConnected = useCallback((url: string): boolean => {
    const sse = getSse(url);
    return sse !== undefined;
  }, [getSse]);

  const connect = useCallback((connectUrl: string, disconnectUrl?: string) => {
    if (isAlreadyConnected(connectUrl)) {
      return;
    }

    const tryConnect = () => {
      // tryConnectTimeout.current = setTimeout(() => {
      const eventSource = new EventSource(connectUrl, {
        withCredentials: true,
      });

      // console.log('@eventSource.CONNECTING', eventSource.CONNECTING);

      eventSource.onopen = function() {
        console.log(`success to connect to server "${connectUrl}"`);
        const sseInfo: IUseServerSentEventManager.SseInfo = {
          connectUrl,
          disconnectUrl,
          eventSource,
        };
        sseInfos.current.push(sseInfo);
        if (typeof onConnectSuccessSseInfo === 'function') onConnectSuccessSseInfo(sseInfo);
        // setRecentUpdatedAt({ createdAt: Date.now() });
      };
  
      eventSource.onerror = function() {
        console.warn(`failure to connect to server "${connectUrl}"`);
        // eventSource.close();
        // removeSse(connectUrl);
        if (typeof disconnectUrl === 'string') {
          axios.get(disconnectUrl).then(res => {
  
          }).catch(error => {
  
          }).finally(() => {
            // tryConnect(3000);
          });
        } else {
          // tryConnect(3000);
        }
      };
      // }, delay);
    };

    tryConnect();
  }, [isAlreadyConnected, onConnectSuccessSseInfo]);

  const disconnect = useCallback((connectUrl: string) => {
    console.log('@disconnect', connectUrl);
    const sseInfo = sseInfos.current.find(x => x.connectUrl === connectUrl);
    if (sseInfo === undefined) return;
    
    const entries = Array.from(ssePureListenerInfos.current.entries());
    for (const [key, pureListenerInfo] of entries) {
      sseInfo.eventSource.removeEventListener(pureListenerInfo.eventName, pureListenerInfo.listener);
      ssePureListenerInfos.current.delete(`${connectUrl}${seperatorChar}${pureListenerInfo.eventName}`);
    }

    sseInfo.eventSource.close();
    sseInfos.current = sseInfos.current.filter(x => x.connectUrl !== connectUrl);
    // setRecentUpdatedAt({ createdAt: Date.now() });
  }, []);

  const saveSubscriberInfo = useCallback((subscriber: IUseServerSentEventManager.SubscriberInfo) => {
    sseSubscriberInfos.current.set(`${subscriber.connectUrl}${seperatorChar}${subscriber.eventName}`, subscriber);
  }, []);

  const subscribe = useCallback((connectUrl: string, eventName: string) => {
    const sseInfo = sseInfos.current.find(x => x.connectUrl === connectUrl);
    if (sseInfo === undefined) {
      console.error(`${connectUrl}에 연결되어 있지 않습니다.`);
      return;
    }

    // const ssePureListenerInfo = ssePureListenerInfos.current.get(`${connectUrl}${seperatorChar}${eventName}`);
    // if (ssePureListenerInfo !== undefined) {
    //   console.warn('이미 구독 중입니다.');
    //   return;
    // }

    const ssePureListenerInfo = ssePureListenerInfos.current.get(`${connectUrl}${seperatorChar}${eventName}`);
    if (ssePureListenerInfo !== undefined) {
      // sseInfo.eventSource.removeEventListener(ssePureListenerInfo.eventName, ssePureListenerInfo.listener);  
      // ssePureListenerInfos.current.delete(`${connectUrl}${seperatorChar}${eventName}`);
      return;
    }

    const listener: IUseServerSentEventManager.SseListener = (event) => {
      const subscriberInfo = sseSubscriberInfos.current.get(`${connectUrl}${seperatorChar}${eventName}`);
      if (subscriberInfo === undefined) return;
      subscriberInfo.listener(event);
    };
    ssePureListenerInfos.current.set(`${connectUrl}${seperatorChar}${eventName}`, { eventName, listener });
    sseInfo.eventSource.addEventListener(eventName, listener);
  }, []);

  const unsubscribe = useCallback((connectUrl: string, eventName: string) => {
    const sseInfo = sseInfos.current.find(x => x.connectUrl === connectUrl);
    if (sseInfo === undefined) {
      console.error(`${connectUrl}에 연결되어 있지 않습니다.`);
      return;
    }
    const ssePureListenerInfo = ssePureListenerInfos.current.get(`${connectUrl}${seperatorChar}${eventName}`);
    if (ssePureListenerInfo === undefined) {
      console.error(`콜백 정보가 없습니다.`);
      return;
    }
    sseInfo.eventSource.removeEventListener(eventName, ssePureListenerInfo.listener);
    ssePureListenerInfos.current.delete(`${connectUrl}${seperatorChar}${eventName}`);
  }, []);

  const isConnected = useCallback((connectUrl: string) => {
    const target = sseInfos.current.find(x => x.connectUrl === connectUrl);
    return target !== undefined;
  }, []);

  useEffect(() => {
    return function unmounted() {
      for (const sseInfo of sseInfos.current) {
        disconnect(sseInfo.connectUrl);
      }
      sseInfos.current = [];
    };  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   return () => {
  //     clearTimeout(tryConnectTimeout.current);
  //   };
  // }, []);

  return {
    connect,
    disconnect,
    saveSubscriberInfo,
    subscribe,
    unsubscribe,
    isConnected,
    // recentUpdatedAt,
  };
}