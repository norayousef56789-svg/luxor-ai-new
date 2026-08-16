import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  registerBusinessAccount,
  registerBusinessForExistingUser,
} from "@/lib/business.functions";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BusinessType =
  Database["public"]["Enums"]["business_type"];

const TYPES: BusinessType[] = [
  "Hotel",
  "Restaurant",
  "Bazaar",
  "Tour Company",
];

export const Route = createFileRoute("/business/register")({
  head: () => ({
    meta: [
      {
        title: "Register your business — Luxor AI",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  // التسجيل الجديد
  const register = useServerFn(registerBusinessAccount);

  // تسجيل Business لحساب موجود بالفعل
  const registerExisting = useServerFn(
    registerBusinessForExistingUser,
  );

  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    type: "Hotel" as BusinessType,
    phone: "",
    email: "",
    password: "",
    address: "",
    description: "",
  });

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // هل المستخدم عامل Login بالفعل؟
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // إيميل المستخدم الحالي
  const [currentEmail, setCurrentEmail] = useState("");

  // =====================================================
  // معرفة حالة تسجيل الدخول عند فتح الصفحة
  // =====================================================

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);

        const email = session.user.email ?? "";

        setCurrentEmail(email);

        setForm((current) => ({
          ...current,
          email,
          fullName:
            current.fullName ||
            session.user.user_metadata?.full_name ||
            "",
        }));
      }
    };

    checkSession();
  }, []);

  // =====================================================
  // تغيير قيم الفورم
  // =====================================================

  const set = <K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErr(null);
    setBusy(true);

    try {
      // نجيب الـsession مرة ثانية وقت التسجيل
      // للتأكد إن المستخدم ما زال Logged In
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      // =================================================
      // الحالة الأولى:
      // المستخدم داخل الموقع بالفعل
      // =================================================

      if (session?.user && session.access_token) {
        const email = session.user.email;

        if (!email) {
          throw new Error(
            "Your account does not have an email address.",
          );
        }

        await registerExisting({
          data: {
            fullName:
              form.fullName ||
              session.user.user_metadata?.full_name ||
              email,

            businessName: form.businessName,

            type: form.type,

            phone: form.phone,

            // نستخدم إيميل الحساب الحالي
            email,

            address: form.address,

            description: form.description,
          },

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      }

      // =================================================
      // الحالة الثانية:
      // المستخدم مش عامل Login
      // إنشاء حساب جديد
      // =================================================

      else {
        await register({
          data: form,
        });

        // تسجيل الدخول بالحساب الجديد
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });

        if (signInError) {
          throw signInError;
        }
      }

      // =================================================
      // إرسال إشعار للأدمن
      // =================================================

      const notificationEmail =
        session?.user?.email || form.email;

      const { error: notificationError } =
        await supabase.functions.invoke(
          "notify-admin-signup",
          {
            body: {
              type: "signup",
              email: notificationEmail,
              name: form.fullName,
            },
          },
        );

      // لو الإشعار فشل، لا نمنع صاحب النشاط من الدخول
      if (notificationError) {
        console.error(
          "Admin notification failed:",
          notificationError,
        );
      }

      // =================================================
      // الانتقال إلى Dashboard
      // =================================================

      navigate({
        to: "/business/dashboard",
      });
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : "Registration failed",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-center text-gold text-xs uppercase tracking-[0.3em] divider-gold">
        For business owners
      </p>

      <h1 className="mt-3 text-center font-display text-4xl">
        Register your business
      </h1>

      <p className="mt-3 text-center text-muted-foreground">
        Join Luxor's smart tourism platform. Listings are
        reviewed by Luxor admins before going live.
      </p>

      {/* =================================================
          رسالة للمستخدم المسجل بالفعل
      ================================================= */}

      {isLoggedIn && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You are signed in as
          </p>

          <p className="mt-1 font-medium text-gold">
            {currentEmail}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Your business will be linked to this account.
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-10 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-8"
      >
        {/* =================================================
            Full Name
        ================================================= */}

        <div className="space-y-2">
          <Label>Your full name</Label>

          <Input
            value={form.fullName}
            onChange={(e) =>
              set("fullName", e.target.value)
            }
            required
          />
        </div>

        {/* =================================================
            Business Name
        ================================================= */}

        <div className="space-y-2">
          <Label>Business name</Label>

          <Input
            value={form.businessName}
            onChange={(e) =>
              set("businessName", e.target.value)
            }
            required
            placeholder="Nile Sunset Bazaar"
          />
        </div>

        {/* =================================================
            Business Type
        ================================================= */}

        <div className="space-y-2">
          <Label>Business type</Label>

          <select
            value={form.type}
            onChange={(e) =>
              set(
                "type",
                e.target.value as BusinessType,
              )
            }
            className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            Phone
        ================================================= */}

        <div className="space-y-2">
          <Label>Phone</Label>

          <Input
            value={form.phone}
            onChange={(e) =>
              set("phone", e.target.value)
            }
            required
            placeholder="+20 …"
          />
        </div>

        {/* =================================================
            Email + Password
            يظهروا فقط لو المستخدم مش عامل Login
        ================================================= */}

        {!isLoggedIn && (
          <>
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  set("email", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>

              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  set("password", e.target.value)
                }
                required
                minLength={8}
              />
            </div>
          </>
        )}

        {/* =================================================
            Address
        ================================================= */}

        <div className="space-y-2">
          <Label>Address</Label>

          <Input
            value={form.address}
            onChange={(e) =>
              set("address", e.target.value)
            }
            required
            placeholder="Street, district, Luxor"
          />
        </div>

        {/* =================================================
            Description
        ================================================= */}

        <div className="space-y-2">
          <Label>Description (optional)</Label>

          <Textarea
            value={form.description}
            onChange={(e) =>
              set("description", e.target.value)
            }
            placeholder="A short pitch for your business…"
          />
        </div>

        {/* =================================================
            Error
        ================================================= */}

        {err && (
          <p className="text-sm text-destructive">
            {err}
          </p>
        )}

        {/* =================================================
            Submit
        ================================================= */}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60"
        >
          {busy
            ? "Submitting…"
            : isLoggedIn
              ? "Submit business for approval"
              : "Create account & submit for approval"}
        </button>

        {/* =================================================
            Login Link
            يظهر فقط لغير المسجل
        ================================================= */}

        {!isLoggedIn && (
          <p className="text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link
              to="/business/login"
              className="text-gold hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}