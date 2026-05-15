"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Image as ImageIcon, // 重命名以避免与 HTML 或 Next Image 冲突
  LoaderCircle, 
  LockKeyhole, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";
import { useRedirectIfAuthenticated } from "@/lib/use-auth-guard";
import { getDefaultRouteForRole, setStoredAuthSession } from "@/store/auth";

const COMPLIANCE_STATEMENT = `风险与合规声明
欢迎使用本服务。为了保障您的合法权益，维护健康的网络环境，请在开始使用前仔细阅读以下条款。一旦您开始使用本服务，即视为您已充分理解并同意本声明的所有内容。

一、 服务性质说明
定位与用途： 本服务仅作为技术演示、科研交流及个人学习辅助工具提供。

二、 提示词（Prompt）与内容责任
输入风险： 用户需对其输入的提示词及素材负全部责任。请务必确保输入内容不违反法律法规。

三、 数据存储与隐私安全
服务器零留存： 我们的服务器不存储用户的任何对话记录或生成结果。
数据自留： 清理缓存、重装系统均会导致数据丢失，请自行备份。

（此处省略部分长文本以保持代码整洁，请保留你原有的完整文本）`;

const featureItems = [
  { icon: ImageIcon, label: "灵感绘图", value: "文生图 / 图生图" },
  { icon: ShieldCheck, label: "本地历史", value: "记录保存在当前设备" },
  { icon: Sparkles, label: "快速续作", value: "结果图可继续编辑" },
];

export default function LoginPage() {
  const router = useRouter();
  const [authKey, setAuthKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAcknowledgedStatement, setHasAcknowledgedStatement] = useState(false);
  const { isCheckingAuth } = useRedirectIfAuthenticated();

  const handleLogin = async () => {
    if (!hasAcknowledgedStatement) {
      toast.error("请先阅读并确认风险与合规声明");
      return;
    }
    const normalizedAuthKey = authKey.trim();
    if (!normalizedAuthKey) {
      toast.error("请输入访问密钥");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login(normalizedAuthKey);
      await setStoredAuthSession({
        key: normalizedAuthKey,
        role: data.role,
        subjectId: data.subject_id,
        name: data.name,
      });
      router.replace(getDefaultRouteForRole(data.role));
    } catch (error: any) {
      toast.error(error?.message || "登录失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <LoaderCircle className="size-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] p-4 sm:p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#eef7f4_44%,#f4efe8_100%)]" />
      <div className="absolute left-[8%] top-[10%] -z-10 h-64 w-64 rounded-full bg-teal-200/30 blur-[100px]" />
      <div className="absolute bottom-[8%] right-[10%] -z-10 h-72 w-72 rounded-full bg-amber-200/30 blur-[100px]" />

      {/* 主卡片容器 */}
      <div className="grid w-full max-w-[1100px] overflow-hidden rounded-[32px] border border-white/60 bg-white/65 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] transition-shadow duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.6)]">
        
        {/* 左侧展示区 */}
        <section className="relative hidden flex-col overflow-hidden bg-[#0f172a] text-white lg:flex">
          {/* 动态渐变底色 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.15),transparent_40%),linear-gradient(145deg,#0f172a 0%,#1e293b 100%)]" />
          
          <div className="relative z-10 flex h-full flex-col p-10">
            {/* 顶部标识 */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-wider text-teal-50 backdrop-blur-md">
                <Sparkles className="size-3.5 text-teal-400" />
                AI IMAGE WORKSPACE
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg">
                <ImageIcon className="size-6 text-amber-200" />
              </div>
            </div>

            {/* 中间文字标题 */}
            <div className="mt-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-400/80">Private Access</p>
              <h1 className="mt-6 text-4xl font-bold leading-[1.2] tracking-tight xl:text-5xl">
                把灵感直接<br />带进创作台
              </h1>
              <p className="mt-6 max-w-[380px] text-[15px] leading-relaxed text-slate-400">
                登录后进入更轻、更专注的普通用户图片工作台，生成、编辑、续作和本地历史集中在一个界面里。
              </p>
            </div>

            {/* 底部特征列表 */}
            <div className="mt-auto grid gap-3">
              {featureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.12] hover:scale-[1.02]">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/90">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 右侧登录区 */}
        <section className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-[380px]">
            <div className="mb-10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl">
                <LockKeyhole className="size-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">欢迎回来</h2>
              <p className="mt-3 text-sm text-slate-500">
                输入访问密钥，开启您的创意之旅。
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">访问密钥</label>
                <Input
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="请输入访问密钥"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-4 transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  disabled={!hasAcknowledgedStatement || isSubmitting}
                />
              </div>

              <Button
                className="h-14 w-full rounded-2xl bg-slate-950 text-base font-semibold text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.35)] active:scale-[0.98]"
                onClick={handleLogin}
                disabled={!hasAcknowledgedStatement || isSubmitting}
              >
                {isSubmitting ? <LoaderCircle className="mr-2 size-5 animate-spin" /> : null}
                登录工作台
                {!isSubmitting && <ArrowRight className="ml-2 size-5" />}
              </Button>
            </div>

            <div className="mt-8 flex gap-3 rounded-2xl bg-teal-50/50 p-4 text-[13px] leading-relaxed text-teal-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" />
              <p>已阅读合规声明后即可登录。历史记录仅保存在当前浏览器缓存中。</p>
            </div>
          </div>
        </section>
      </div>

      {/* 弹窗部分 */}
      <Dialog open={!hasAcknowledgedStatement} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="flex max-h-[88dvh] w-[92vw] max-w-[640px] flex-col overflow-hidden rounded-[28px] p-0">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-8 sm:py-6">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
              <ShieldCheck className="size-5 text-teal-600 sm:size-6" />
              风险与合规声明
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-8 sm:py-6">
            <div className="whitespace-pre-wrap text-[13px] leading-7 text-slate-600 sm:text-[14px] sm:leading-8">
              {COMPLIANCE_STATEMENT}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-slate-100 bg-white p-4 sm:p-6">
            <Button
              className="h-12 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800 sm:w-auto sm:px-10"
              onClick={() => setHasAcknowledgedStatement(true)}
            >
              我已阅读并知晓
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
