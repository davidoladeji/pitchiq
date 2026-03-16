import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { verifyDomainDns } from "@/lib/custom-domain";

/**
 * POST /api/custom-domain/[id]/verify
 * Trigger DNS verification for a pending custom domain.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const domain = await prisma.customDomain.findUnique({
      where: { id: params.id },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (domain.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (domain.status === "active") {
      return NextResponse.json({ domain, message: "Domain already verified" });
    }

    const verified = await verifyDomainDns(
      domain.domain,
      domain.verificationToken
    );

    if (!verified) {
      // Update status to failed if it was pending
      if (domain.status === "pending") {
        await prisma.customDomain.update({
          where: { id: params.id },
          data: { status: "failed" },
        });
      }

      return NextResponse.json(
        {
          error: "DNS verification failed",
          hint: `Ensure a TXT record exists for _pitchiq-verify.${domain.domain} with value ${domain.verificationToken}. DNS changes may take up to 48 hours to propagate.`,
        },
        { status: 422 }
      );
    }

    const updated = await prisma.customDomain.update({
      where: { id: params.id },
      data: {
        status: "active",
        verifiedAt: new Date(),
        sslStatus: "active",
      },
      select: {
        id: true,
        domain: true,
        status: true,
        verificationToken: true,
        verifiedAt: true,
        sslStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ domain: updated });
  } catch (error) {
    console.error("POST /api/custom-domain/[id]/verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
