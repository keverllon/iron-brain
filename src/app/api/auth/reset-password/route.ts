import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const requestResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetTokens: Map<string, { email: string; expires: number }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "request") {
      const validated = requestResetSchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: "Email inválido" },
          { status: 400 },
        );
      }

      const { email } = validated.data;
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return NextResponse.json({
          success: true,
          message: "Se o email existir, você receberá um link de recuperação",
        });
      }

      const token = crypto.randomUUID();
      const expires = Date.now() + 3600000;
      resetTokens.set(token, { email, expires });
      
      console.log(`Token de recuperação para ${email}: ${token}`);
      
      return NextResponse.json({
        success: true,
        message: "Se o email existir, você receberá um link de recuperação",
        devToken: process.env.NODE_ENV === "development" ? token : undefined,
      });
    }

    const validated = resetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 },
      );
    }

    const { token, newPassword } = validated.data;
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 400 },
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { success: false, error: "Token expirado" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ 
      where: { email: tokenData.email } 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    resetTokens.delete(token);

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Error in password reset:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar solicitação" },
      { status: 500 },
    );
  }
}