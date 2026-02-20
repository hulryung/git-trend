import { WebhookManager } from "@/components/webhook-manager";

export const metadata = {
  title: "Webhooks - git-trend",
  description: "Webhook 알림 관리",
};

export default function WebhooksPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground mt-1">
          트렌딩 데이터를 Slack, Discord, Teams 등으로 자동 알림 받으세요.
        </p>
      </div>
      <WebhookManager />
    </div>
  );
}
