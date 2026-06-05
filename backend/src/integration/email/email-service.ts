import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../config/env';
import { logger } from '../../shared/utils/logger';

let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: env.NODE_ENV === 'production',
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = createTransporter();
  }

  return transporter;
};

export const emailService = {
  async verifyTransport(): Promise<void> {
    if (!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)) {
      logger.warn('SMTP credentials are not fully configured. Skipping startup SMTP verification.');
      return;
    }

    logger.info(
      {
        smtpHost: env.SMTP_HOST,
        smtpUser: env.SMTP_USER,
      },
      'Verifying SMTP transporter connection.',
    );

    try {
      await getTransporter().verify();
      logger.info(
        {
          smtpHost: env.SMTP_HOST,
          smtpUser: env.SMTP_USER,
        },
        'SMTP transporter verification succeeded.',
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          smtpHost: env.SMTP_HOST,
          smtpUser: env.SMTP_USER,
        },
        'SMTP transporter verification failed.',
      );
    }
  },
  async sendEmailVerificationCode(email: string, code: string, expiresAt: Date): Promise<void> {
    const verificationMinutes = Math.max(
      1,
      Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60)),
    );

    const message = {
      from: env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'EventSync email verification code',
      text: [
        'Welcome to EventSync.',
        '',
        `Your verification code is: ${code}`,
        `It expires in ${verificationMinutes} minute(s).`,
        '',
        'If you did not request this account, you can ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0c1e3c;">
          <h2>Welcome to EventSync</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: 700; letter-spacing: 0.3em;">${code}</p>
          <p>It expires in ${verificationMinutes} minute(s).</p>
          <p>If you did not request this account, you can ignore this email.</p>
        </div>
      `,
    };

    let info: Awaited<ReturnType<Transporter['sendMail']>>;

    try {
      info = await getTransporter().sendMail(message);
    } catch (error) {
      const emailError = error as {
        message?: string;
        code?: string;
        response?: string;
        responseCode?: number;
        command?: string;
      };

      logger.error(
        {
          err: error,
          email,
          message: emailError.message,
          code: emailError.code,
          response: emailError.response,
          responseCode: emailError.responseCode,
          command: emailError.command,
        },
        'Failed to send verification email through Nodemailer transport.',
      );

      throw error;
    }

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      logger.info({ email, messageId: info.messageId }, 'Verification email sent.');
      return;
    }

    logger.warn(
      {
        email,
        code,
        verificationExpiresAt: expiresAt.toISOString(),
        preview: info.message.toString(),
      },
      'SMTP is not configured. Verification email used JSON transport for local development.',
    );
  },
};
