import { Suspense } from "react";
import SendBulkEmailPage from "../components/SendBulkEmailPage";

export default function SendBulkEmailRoute() {
  return (
    <Suspense>
      <SendBulkEmailPage />
    </Suspense>
  );
}
