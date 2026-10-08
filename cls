warning: in the working copy of 'app/api/admin/events/route.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'app/login/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'app/signup/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'components/layout/Navbar.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'lib/server/repositories/profile.repository.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/app/api/admin/events/route.ts b/app/api/admin/events/route.ts[m
[1mindex ba947d4..031350b 100644[m
[1m--- a/app/api/admin/events/route.ts[m
[1m+++ b/app/api/admin/events/route.ts[m
[36m@@ -4,6 +4,7 @@[m [mimport { profileRepository } from "@/lib/server/repositories/profile.repository"[m
 import { submissionRepository } from "@/lib/server/repositories/submission.repository";[m
 import { eventRepository } from "@/lib/server/repositories/event.repository";[m
 import { ok, badRequest, serverError } from "@/lib/server/response";[m
[32m+[m[32mimport { isConfiguredAdminEmail } from "@/lib/server/admin";[m
 [m
 /** GET /api/admin/events — List pending host submissions for admin review */[m
 export async function GET(request: NextRequest) {[m
[36m@@ -16,8 +17,13 @@[m [mexport async function GET(request: NextRequest) {[m
       );[m
     }[m
 [m
[31m-    const profile = await profileRepository.getById(user.id);[m
[31m-    if (!profile || profile.role !== "admin") {[m
[32m+[m[32m    const profile = await profileRepository.getById(user.id, user);[m
[32m+[m[32m    const isAdmin =[m
[32m+[m[32m      profile?.role === "admin" ||[m
[32m+[m[32m      isConfiguredAdminEmail(user.email) ||[m
[32m+[m[32m      isConfiguredAdminEmail(profile?.email);[m
[32m+[m
[32m+[m[32m    if (!isAdmin) {[m
       return Response.json([m
         { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required." } },[m
         { status: 403 }[m
[36m@@ -43,8 +49,13 @@[m [mexport async function PATCH(request: NextRequest) {[m
       );[m
     }[m
 [m
[31m-    const profile = await profileRepository.getById(user.id);[m
[31m-    if (!profile || profile.role !== "admin") {[m
[32m+[m[32m    const profile = await profileRepository.getById(user.id, user);[m
[32m+[m[32m    const isAdmin =[m
[32m+[m[32m      profile?.role === "admin" ||[m
[32m+[m[32m      isConfiguredAdminEmail(user.email) ||[m
[32m+[m[32m      isConfiguredAdminEmail(profile?.email);[m
[32m+[m
[32m+[m[32m    if (!isAdmin) {[m
       return Response.json([m
         { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required." } },[m
         { status: 403 }[m
[1mdiff --git a/app/login/page.tsx b/app/login/page.tsx[m
[1mindex 2f920dd..6b0a3b1 100644[m
[1m--- a/app/login/page.tsx[m
[1m+++ b/app/login/page.tsx[m
[36m@@ -7,6 +7,7 @@[m [mimport { createBrowserClient } from "@/lib/supabase/client";[m
 import { isProfileComplete } from "@/lib/utils/profile";[m
 import Input from "@/components/ui/Input";[m
 import Button from "@/components/ui/Button";[m
[32m+[m[32mimport { RefreshCw } from "lucide-react";[m
 [m
 function LoginForm() {[m
   const router = useRouter();[m
[36m@@ -17,21 +18,37 @@[m [mfunction LoginForm() {[m
   const [password, setPassword] = useState("");[m
   const [loading, setLoading] = useState(false);[m
   const [error, setError] = useState<string | null>(null);[m
[32m+[m[32m  const [isUnconfirmed, setIsUnconfirmed] = useState(false);[m
[32m+[m[32m  const [resending, setResending] = useState(false);[m
[32m+[m[32m  const [resendStatus, setResendStatus] = useState<{[m
[32m+[m[32m    success: boolean;[m
[32m+[m[32m    message: string;[m
[32m+[m[32m  } | null>(null);[m
 [m
   const handleLogin = async (e: React.FormEvent) => {[m
     e.preventDefault();[m
     setLoading(true);[m
     setError(null);[m
[32m+[m[32m    setIsUnconfirmed(false);[m
[32m+[m[32m    setResendStatus(null);[m
 [m
     try {[m
       const supabase = createBrowserClient();[m
[32m+[m[32m      const normalizedEmail = email.trim().toLowerCase();[m
[32m+[m
       const { error: authError } = await supabase.auth.signInWithPassword({[m
[31m-        email,[m
[32m+[m[32m        email: normalizedEmail,[m
         password,[m
       });[m
 [m
       if (authError) {[m
[31m-        if (authError.message.includes("Invalid login credentials")) {[m
[32m+[m[32m        if ([m
[32m+[m[32m          authError.message.toLowerCase().includes("email not confirmed") ||[m
[32m+[m[32m          authError.message.toLowerCase().includes("email_not_confirmed")[m
[32m+[m[32m        ) {[m
[32m+[m[32m          setIsUnconfirmed(true);[m
[32m+[m[32m          setError("Please verify your email address before logging in.");[m
[32m+[m[32m        } else if (authError.message.includes("Invalid login credentials")) {[m
           setError("Invalid email or password.");[m
         } else {[m
           setError(authError.message);[m
[36m@@ -68,6 +85,52 @@[m [mfunction LoginForm() {[m
     }[m
   };[m
 [m
[32m+[m[32m  const handleResendConfirmation = async () => {[m
[32m+[m[32m    const trimmedEmail = email.trim().toLowerCase();[m
[32m+[m[32m    if (!trimmedEmail) {[m
[32m+[m[32m      setError("Please enter your email address to resend confirmation.");[m
[32m+[m[32m      return;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    setResending(true);[m
[32m+[m[32m    setResendStatus(null);[m
[32m+[m
[32m+[m[32m    try {[m
[32m+[m[32m      const origin =[m
[32m+[m[32m        typeof window !== "undefined"[m
[32m+[m[32m          ? window.location.origin[m
[32m+[m[32m          : process.env.NEXT_PUBLIC_BASE_URL || "https://havli.vercel.app";[m
[32m+[m
[32m+[m[32m      const supabase = createBrowserClient();[m
[32m+[m[32m      const { error: resendErr } = await supabase.auth.resend({[m
[32m+[m[32m        type: "signup",[m
[32m+[m[32m        email: trimmedEmail,[m
[32m+[m[32m        options: {[m
[32m+[m[32m          emailRedirectTo: `${origin}/auth/confirm`,[m
[32m+[m[32m        },[m
[32m+[m[32m      });[m
[32m+[m
[32m+[m[32m      if (resendErr) {[m
[32m+[m[32m        setResendStatus({[m
[32m+[m[32m          success: false,[m
[32m+[m[32m          message: resendErr.message,[m
[32m+[m[32m        });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        setResendStatus({[m
[32m+[m[32m          success: true,[m
[32m+[m[32m          message: "Confirmation link sent! Please check your inbox.",[m
[32m+[m[32m        });[m
[32m+[m[32m      }[m
[32m+[m[32m    } catch {[m
[32m+[m[32m      setResendStatus({[m
[32m+[m[32m        success: false,[m
[32m+[m[32m        message: "Failed to resend confirmation email. Please try again.",[m
[32m+[m[32m      });[m
[32m+[m[32m    } finally {[m
[32m+[m[32m      setResending(false);[m
[32m+[m[32m    }[m
[32m+[m[32m  };[m
[32m+[m
   return ([m
     <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6">[m
       <div className="text-center">[m
[36m@@ -91,10 +154,44 @@[m [mfunction LoginForm() {[m
         </div>[m
       )}[m
 [m
[31m-      {error && ([m
[31m-        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">[m
[31m-          <p className="text-sm text-red-400">{error}</p>[m
[32m+[m[32m      {isUnconfirmed ? ([m
[32m+[m[32m        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-left space-y-3">[m
[32m+[m[32m          <div className="space-y-1">[m
[32m+[m[32m            <p className="text-sm font-bold text-amber-300">[m
[32m+[m[32m              Email verification required[m
[32m+[m[32m            </p>[m
[32m+[m[32m            <p className="text-x