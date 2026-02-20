"use client";

import { useState, useCallback } from "react";
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
import { Trash2, Plus, Bell, Lock, Check, X } from "lucide-react";

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

function authHeaders(password: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };
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

function WebhookRegisterForm() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterMinStars, setFilterMinStars] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !platform) return;

    setSubmitting(true);
    const filters: Record<string, string | number> = {};
    if (filterLanguage) filters.language = filterLanguage;
    if (filterMinStars) filters.minStars = Number(filterMinStars);

    const res = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        platform,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setUrl("");
      setPlatform("");
      setFilterLanguage("");
      setFilterMinStars("");
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Check className="w-10 h-10 text-primary mx-auto" />
            <p className="font-semibold">등록 요청 완료</p>
            <p className="text-sm text-muted-foreground">
              관리자 승인 후 알림이 발송됩니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitted(false)}
            >
              추가 등록
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Webhook 등록
        </CardTitle>
        <CardDescription>
          트렌딩 데이터를 받을 webhook URL을 등록하세요. 관리자 승인 후 매일
          자동으로 알림이 발송됩니다.
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
            {submitting ? "등록 중..." : "등록 요청"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WebhookAdminPanel() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = useCallback(async (pw: string) => {
    const res = await fetch("/api/webhook", {
      headers: { "x-admin-password": pw },
    });
    if (!res.ok) return;
    const data = await res.json();
    setWebhooks(data);
    setLoading(false);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/webhook", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setAuthenticated(true);
      setAuthError(false);
      fetchWebhooks(password);
    } else {
      setAuthError(true);
    }
  }

  async function handleToggle(id: number, isActive: boolean) {
    await fetch("/api/webhook", {
      method: "PATCH",
      headers: authHeaders(password),
      body: JSON.stringify({ id, isActive }),
    });
    fetchWebhooks(password);
  }

  async function handleDelete(id: number) {
    await fetch("/api/webhook", {
      method: "DELETE",
      headers: authHeaders(password),
      body: JSON.stringify({ id }),
    });
    fetchWebhooks(password);
  }

  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            관리자 영역
          </CardTitle>
          <CardDescription>
            등록된 webhook을 관리하려면 비밀번호를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex gap-3">
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(false);
              }}
              aria-invalid={authError}
              required
              className="flex-1"
            />
            <Button type="submit">확인</Button>
          </form>
          {authError && (
            <p className="text-sm text-destructive mt-2">
              비밀번호가 올바르지 않습니다.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Webhook 관리
        </CardTitle>
        <CardDescription>
          {webhooks.length}개 등록 / {webhooks.filter((w) => w.isActive).length}
          개 활성
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
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          wh.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {wh.isActive ? "승인됨" : "대기 중"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {maskUrl(wh.url)}
                    </p>
                    {filters && (
                      <p className="text-xs text-muted-foreground mt-1">
                        필터:{" "}
                        {filters.language && `언어=${filters.language}`}
                        {filters.language && filters.minStars && ", "}
                        {filters.minStars && `최소 스타=${filters.minStars}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {wh.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggle(wh.id, false)}
                        title="비활성화"
                        className="text-muted-foreground hover:text-orange-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggle(wh.id, true)}
                        title="승인"
                        className="text-muted-foreground hover:text-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(wh.id)}
                      title="삭제"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WebhookManager() {
  return (
    <div className="space-y-6">
      <WebhookRegisterForm />
      <WebhookAdminPanel />
    </div>
  );
}
