export type MailchimpError = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};
export type MailchimpResponse = {
  id: string;
  email_address: string;
  status: "subscribed" | "unsubscribed" | "pending" | "cleaned" | "archived";
  unique_email_id: string;
  list_id: string;

  // Campos opcionales
  merge_fields?: Record<string, any>;
  stats?: {
    avg_open_rate?: number;
    avg_click_rate?: number;
  };

  // Para permitir campos adicionales que Mailchimp agregue en el futuro
  [key: string]: any;
};

export type ErrorCode =
  | "EMAIL_REQUIRED"
  | "MISSING_ENV"
  | "ALREADY_SUBSCRIBED"
  | "MAILCHIMP_ERROR"
  | "SERVER_ERROR";

export type SubscribeResponse =
    | { success: true; data: MailchimpResponse }
  | { success: false; code: ErrorCode; status: number; error?: string };

export interface SubscribeRequest {
  email: string;
}