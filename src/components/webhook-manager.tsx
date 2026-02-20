"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus, Bell } from "lucide-react";

interface WebhookSubscription {
  id: number;
  url: string;
  platform: string;
  filters: string | null;
  isActive: boolean;
  createdAt: string;
}

const platformLabels: Record<string, string> = {
  slack: "Slack",
  discord: "Discord",
  teams: "Microsoft Teams",
  generic: "Generic (JSON)",
};

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterMinStars, setFilterMinStars] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchWebhooks() {
    const res = await fetch("/api/webhook");
    const data = await res.json();
    setWebhooks(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !platform) return;

    setSubmitting(true);
    const filters: Record<string, string | number> = {};
    if (filterLanguage) filters.language = filterLanguage;
    if (filterMinStars) filters.minStars = Number(filterMinStars);

    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        platform,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      }),
    });

    setUrl("");
    setPlatform("");
    setFilterLanguage("");
    setFilterMinStars("");
    setSubmitting(false);
    fetchWebhooks();
  }

  async function handleDelete(id: number) {
    await fetch("/api/webhook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchWebhooks();
  }

  function maskUrl(url: string) {
    try {
      const u = new URL(url);
      const path = u.pathname;
      return u.origin + path.slice(0, 20) + "..." + path.slice(-8);
    } catch {
      return url.slice(0, 40) + "...";
    }
  }

  function parseFilters(filters: string | null) {
    if (!filters) return null;
    try {
      return JSON.parse(filters);
    } catch {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Webhook 등록
          </CardTitle>
          <CardDescription>
            트렌딩 데이터를 받을 webhook URL을 등록하세요. 매일 수집 시 자동으로
            알림이 발송됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Webhook URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="flex-1"
              />
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="generic">Generic (JSON)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="언어 필터 (예: TypeScript)"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="최소 스타 수"
                value={filterMinStars}
                onChange={(e) => setFilterMinStars(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
            <Button type="submit" disabled={submitting || !url || !platform}>
              {submitting ? "등록 중..." : "등록"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            등록된 Webhooks
          </CardTitle>
          <CardDescription>
            {webhooks.length}개의 webhook이 등록되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">불러오는 중...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              등록된 webhook이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => {
                const filters = parseFilters(wh.filters);
                return (
                  <div
                    key={wh.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {platformLabels[wh.platform] || wh.platform}
                        </span>
                        {!wh.isActive && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            비활성
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {maskUrl(wh.url)}
                      </p>
                      {filters && (
                        <p className="text-xs text-muted-foreground mt-1">
                          필터:{" "}
                          {filters.language && `언어=${filters.language}`}
                          {filters.language && filters.minStars && ", "}
                          {filters.minStars &&
                            `최소 스타=${filters.minStars}`}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(wh.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
