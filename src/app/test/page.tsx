"use client"
import { useServerSentEventManager } from "@/hooks/use-server-sent-event-manager/use-server-sent-event-manager.hook";
import { useEffect } from "react";

export default function Page() {
  const serverSentEventManager = useServerSentEventManager();

  useEffect(() => {
    console.log(serverSentEventManager.isConnected('...'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      테스트 코드 준비중 입니다.
    </div>
  );
}
