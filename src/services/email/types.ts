export interface EmailMessage { to: string; subject: string; html: string; text: string; replyTo?: string; ics?: string }
export interface EmailAdapter { id: string; send(msg: EmailMessage): Promise<{ id: string }> }
