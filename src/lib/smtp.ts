import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

type ContactMailerResult =
    | {
          ok: true;
          transporter: nodemailer.Transporter;
          from: string;
          to: string;
      }
    | {
          ok: false;
          missing: string[];
      };

let cachedTransporter: nodemailer.Transporter | null = null;

function parseBoolean(value: string | undefined): boolean | null {
    if (typeof value !== 'string') return null;

    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;

    return null;
}

function parsePort(value: string | undefined): number | null {
    if (typeof value !== 'string' || value.trim().length === 0) return null;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;

    return parsed;
}

export function getContactMailer(): ContactMailerResult {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS;
    const secure = parseBoolean(process.env.SMTP_SECURE);
    const port = parsePort(process.env.SMTP_PORT);
    const to = process.env.CONTACT_NOTIFICATION_TO?.trim();

    const missing: string[] = [];

    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    if (secure === null) missing.push('SMTP_SECURE');
    if (port === null) missing.push('SMTP_PORT');
    if (!to) missing.push('CONTACT_NOTIFICATION_TO');

    if (missing.length > 0) {
        return { ok: false, missing };
    }

    const smtpHost = host!;
    const smtpUser = user!;
    const smtpPass = pass!;
    const smtpSecure = secure!;
    const smtpPort = port!;
    const notificationTo = to!;

    if (!cachedTransporter) {
        const transportOptions: SMTPTransport.Options = {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        };

        cachedTransporter = nodemailer.createTransport(transportOptions);
    }

    return {
        ok: true,
        transporter: cachedTransporter,
        from: `VANT Contact <${smtpUser}>`,
        to: notificationTo,
    };
}
