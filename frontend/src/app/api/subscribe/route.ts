import { NextResponse } from "next/server";
import { MailchimpError, MailchimpResponse,SubscribeResponse, ErrorCode } from "@/types/index";

// ---------- Tipados ----------

interface SubscribeRequest {
  email: string;
}



// ---------- Utilidades ----------

function getMailchimpAuthHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`;
}

async function parseMailchimpError(res: Response): Promise<MailchimpError> {
  try {
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null) {
      return data as MailchimpError;
    }
    return { detail: "Unknown error format" };
  } catch {
    return { detail: await res.text() };
  }
}

// ---------- Handler ----------

export async function POST(
  req: Request
): Promise<NextResponse<SubscribeResponse>> {
  try {
    const { email } = (await req.json()) as SubscribeRequest;

    if (!email) {
      return NextResponse.json(
        { success: false, code: "EMAIL_REQUIRED", status: 400 },
        { status: 400 }
      );
    }

    const MailchimpKey = process.env.MAILCHIMP_API_KEY!;
    const MailchimpServer = process.env.MAILCHIMP_API_SERVER!;
    const MailchimpAudience = process.env.MAILCHIMP_LIST_ID!;

    if (!MailchimpKey || !MailchimpServer || !MailchimpAudience) {
      return NextResponse.json(
        { success: false, code: "MISSING_ENV", status: 500 },
        { status: 500 }
      );
    }

    const url = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getMailchimpAuthHeader(MailchimpKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    if (!response.ok) {
      const errorData = await parseMailchimpError(response);

      // Caso UX diferenciado: ya suscrito
      if (errorData.title === "Member Exists") {
        return NextResponse.json(
          { success: false, code: "ALREADY_SUBSCRIBED", status: 409 },
          { status: 409 }
        );
      }

      console.error("Mailchimp error:", errorData);

      return NextResponse.json(
        {
          success: false,
          code: "MAILCHIMP_ERROR",
          status: response.status,
          error: errorData.detail ?? "Unknown Mailchimp error",
        },
        { status: response.status }
      );
    }

    const received = (await response.json()) as MailchimpResponse;

    return NextResponse.json(
      { success: true, data: received },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/subscribe:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", status: 500 },
      { status: 500 }
    );
  }
}
