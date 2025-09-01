

import { NextResponse } from "next/server";
import {MailchimpError} from '@/types/index'; 


export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const MailchimpKey = process.env.MAILCHIMP_API_KEY;
    const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
    const MailchimpAudience = process.env.MAILCHIMP_LIST_ID;

    if (!MailchimpKey || !MailchimpServer || !MailchimpAudience) {
      console.error("Faltan variables de entorno Mailchimp");
      return NextResponse.json(
        { error: "Missing Mailchimp environment variables" },
        { status: 500 }
      );
    }

    const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;

    const response = await fetch(customUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MailchimpKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    if (!response.ok) {
      let errorData: MailchimpError = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: await response.text() };
      }

      console.error("Mailchimp error:", errorData);
      return NextResponse.json({ error: errorData.detail }, { status: response.status });
    }

    const received = await response.json();
    return NextResponse.json(received, { status: 200 });
  } catch (error) {
    console.error("Error en /api/subscribe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
