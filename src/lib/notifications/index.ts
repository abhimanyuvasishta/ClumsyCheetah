export type NotificationEvent =
  | "account.created"
  | "order.confirmed"
  | "payment.successful"
  | "order.preparing"
  | "order.out_for_delivery"
  | "order.delivered"
  | "order.cancelled"
  | "refund.initiated";

export type NotificationPayload = {
  event: NotificationEvent;
  recipient: string;
  data: Record<string, string | number | boolean | null>;
};

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<void>;
}

/** Phase 1: persist-ready no-op. Swap for Resend / SMS / WhatsApp adapters later. */
export class OutboxNotificationProvider implements NotificationProvider {
  async send(payload: NotificationPayload): Promise<void> {
    void payload;
    return;
  }
}

export const notifications: NotificationProvider = new OutboxNotificationProvider();
