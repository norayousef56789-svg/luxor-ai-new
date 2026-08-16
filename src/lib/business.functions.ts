import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RegisterInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  businessName: z.string().trim().min(1).max(160),
  type: z.enum(["Hotel", "Restaurant", "Bazaar", "Tour Company"]),
  phone: z.string().trim().min(4).max(40),
  address: z.string().trim().min(4).max(400),
  description: z.string().trim().max(2000).optional().default(""),
});

export const registerBusinessAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RegisterInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // إنشاء حساب جديد لصاحب النشاط
    const { data: created, error } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName },
      });

    if (error || !created.user) {
      throw new Error(
        error?.message ?? "Failed to create account",
      );
    }

    const userId = created.user.id;

    // إضافة business role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: "business",
        },
        {
          onConflict: "user_id,role",
        },
      );

    if (roleError) {
      throw new Error(roleError.message);
    }

    // إنشاء الـ Business
    const { error: bErr } = await supabaseAdmin
      .from("businesses")
      .insert({
        owner_id: userId,
        name: data.businessName,
        type: data.type,
        phone: data.phone,
        email: data.email,
        address: data.address,
        description: data.description || null,
        status: "pending",
      });

    if (bErr) {
      throw new Error(bErr.message);
    }

    return { ok: true, userId };
  });


// ======================================================
// تسجيل Business لحساب موجود بالفعل
// ======================================================

const ExistingBusinessInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  businessName: z.string().trim().min(1).max(160),
  type: z.enum(["Hotel", "Restaurant", "Bazaar", "Tour Company"]),
  phone: z.string().trim().min(4).max(40),
  address: z.string().trim().min(4).max(400),
  description: z.string().trim().max(2000).optional().default(""),
});

export const registerBusinessForExistingUser =
  createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((input: unknown) =>
      ExistingBusinessInput.parse(input),
    )
    .handler(async ({ data, context }) => {
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      const userId = context.userId;

      // إضافة business role للمستخدم الحالي
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          {
            user_id: userId,
            role: "business",
          },
          {
            onConflict: "user_id,role",
          },
        );

      if (roleError) {
        throw new Error(roleError.message);
      }

      // إنشاء Business مربوط بالحساب الحالي
      const { error: bErr } = await supabaseAdmin
        .from("businesses")
        .insert({
          owner_id: userId,
          name: data.businessName,
          type: data.type,
          phone: data.phone,
          email: data.email,
          address: data.address,
          description: data.description || null,
          status: "pending",
        });

      if (bErr) {
        throw new Error(bErr.message);
      }

      return {
        ok: true,
        userId,
      };
    });


const TouristInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const registerTouristAccount = createServerFn({
  method: "POST",
})
  .inputValidator((input: unknown) =>
    TouristInput.parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: created, error } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName },
      });

    if (error || !created.user) {
      throw new Error(
        error?.message ?? "Failed to create account",
      );
    }

    return { ok: true };
  });


export const claimFirstAdmin = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "admin");

    if (cErr) {
      throw new Error(cErr.message);
    }

    if ((count ?? 0) > 0) {
      throw new Error(
        "An administrator already exists for this platform.",
      );
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: context.userId,
        role: "admin",
      });

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });