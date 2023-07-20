import { useServerSentEventManager } from "@/hooks/use-server-sent-event-manager/use-server-sent-event-manager.hook";

export default function Page() {
  const serverSentEventManager = useServerSentEventManager();

  return (
    <div>
      테스트 코드 준비중 입니다.
    </div>
  );
}
