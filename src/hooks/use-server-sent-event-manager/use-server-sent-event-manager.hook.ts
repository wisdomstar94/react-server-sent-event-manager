import { useCallback, useEffect, useRef, useState } from "react";
import { IUseServerSentEventManager } from "./use-server-sent-event-manager.interface";
import axios from "axios";

export function useServerSentEventManager(props?: IUseServerSentEventManager.Props) {
  const sses = useRef<IUseServerSentEventManager.SseInfo[]>([]); 
  const [connectSuccessInfo, setConnectSuccessInfo] = useState<IUseServerSentEventManager.SseInfo>();

  const setSse = useCallback((sseInfo: IUseServerSentEventManager.SseInfo): void => {
    sses.current.push(sseInfo);
  }, []);

  const removeSse = useCallback((connectUrl: string): void => {
    sses.current = sses.current.filter(x => x.connectUrl !== connectUrl);
  }, []);

  const getSse = useCallback((connectUrl: string): IUseServerSentEventManager.SseInfo | undefined => {
    return sses.current.find(x => x.connectUrl === connectUrl);
  }, []);

  const isAlreadyConnected = useCallback((url: string): boolean => {
    const sse = getSse(url);
    return sse !== undefined;
  }, [getSse]);

  const connect = useCallback((connectUrl: string, disconnectUrl?: string) => {
    if (isAlreadyConnected(connectUrl)) {
      return;
    }

    let tryCount = 0;

    const tryConnect = () => {
      if (tryCount > 2) {
        return;
      }

      const eventSource = new EventSource(connectUrl, {
        withCredentials: true,
      });
  
      eventSource.onopen = function() {
        console.log(`success to connect to server "${connectUrl}"`);
        const sse: IUseServerSentEventManager.SseInfo = {
          connectUrl,
          disconnectUrl,
          eventSource,
          listenerItems: [],
        };
        setSse(sse);
        setConnectSuccessInfo(sse);
      };
  
      eventSource.onerror = function() {
        console.warn(`failure to connect to server "${connectUrl}"`);
        eventSource.close();
        removeSse(connectUrl);
        if (typeof disconnectUrl === 'string') {
          axios.get(disconnectUrl).then(res => {
  
          }).catch(error => {
  
          }).finally(() => {
            tryConnect();
          });
        } else {
          tryConnect();
        }
      };

      tryCount++;
    };

    tryConnect();
  }, [isAlreadyConnected, removeSse, setSse]);

  const clear = useCallback((sse: IUseServerSentEventManager.SseInfo) => {
    const {
      connectUrl,
      disconnectUrl,
      eventSource,
      listenerItems,
    } = sse;

    for (const listenerItem of listenerItems) {
      eventSource.removeEventListener(listenerItem.eventName, listenerItem.listener);
    }

    if (typeof disconnectUrl === 'string') {
      axios.get(disconnectUrl).then(res => {

      }).catch(error => {

      }).finally(() => {
        
      });
    }

    eventSource.close();
  }, []);

  const disconnect = useCallback((connectUrl: string) => {
    const sse = getSse(connectUrl);
    if (sse === undefined) return;
    clear(sse);
  }, [clear, getSse]);

  const setListener = useCallback((connectUrl: string, eventName: string, listener: (event: MessageEvent) => void) => {
    const sse = getSse(connectUrl);
    if (sse === undefined) return;
    const eventSource = sse.eventSource;
    eventSource.addEventListener(eventName, listener);
    sse.listenerItems.push({
      eventName,
      listener,
    });
  }, [getSse]);

  const removeListener = useCallback((connectUrl: string, eventName: string) => {
    const sse = getSse(connectUrl);
    if (sse === undefined) return;
    const listenerItem = sse.listenerItems.find(x => x.eventName === eventName);
    if (listenerItem === undefined) return;
    const eventSource = sse.eventSource;
    eventSource.removeEventListener(eventName, listenerItem.listener);
    sse.listenerItems = sse.listenerItems.filter(x => x.eventName !== eventName);
  }, [getSse]);

  useEffect(() => {
    return function unmounted() {
      for (const sse of sses.current) {
        clear(sse);
      }
      sses.current = [];
    };  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connect,
    disconnect,
    connectSuccessInfo,
    setListener,
    removeListener,
  };
}