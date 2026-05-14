import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

const BRAND_COLOR = '#234E26';
const ACCENT_COLOR = '#25D366';

export async function sendQuoteEmail(quoteId: string): Promise<void> {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { 
        items: true,
        organization: {
          include: { emailConfig: true }
        }
      },
    });
    if (!quote) return;

    const config = quote.organization.emailConfig;
    const transporter = createTransporter(config);

    if (!transporter) {
      logger.warn(`Email NO enviado para cotización ${quote.numero}: Credenciales SMTP no configuradas.`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const html = generateQuoteTemplate({
      quoteNumber: quote.numero,
      clientName: quote.clienteNombre,
      items: quote.items.map(i => ({ name: i.productoNombre, detail: `${i.cantidad} x ${i.diasAlquiler}d`, subtotal: i.subtotal })),
      total: quote.total,
      token: quote.tokenPublico,
      frontendUrl
    });

    await transporter.sendMail({
      from: config ? `"${config.fromName || 'OLCA Rental'}" <${config.fromEmail || config.user}>` : `"OLCA Rental" <${process.env.SMTP_USER}>`,
      to: quote.clienteEmail,
      subject: `Tu cotización ${quote.numero} — OLCA Rental`,
      html,
    });

    logger.info(`✉️  Email enviado para ${quote.numero}`);
  } catch (err) {
    logger.error('Error sending quote email:', err);
  }
}

export async function sendTestEmail(config: any, targetEmail: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  const html = generateQuoteTemplate({
    quoteNumber: 'TEST-001',
    clientName: 'Usuario de Prueba',
    items: [
      { name: 'Vehículo de Prueba 4x4', detail: '1 x 7d', subtotal: 150000 },
    ],
    total: 150000,
    token: 'test-token',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  await transporter.sendMail({
    from: `"${config.fromName || 'OLCA Rental (Test)'}" <${config.fromEmail || config.user}>`,
    to: targetEmail,
    subject: `Email de prueba — Configuración SMTP OLCA`,
    html,
  });
}

function createTransporter(config: any) {
  if (config) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

function generateQuoteTemplate(data: { quoteNumber: string, clientName: string, items: any[], total: number, token: string, frontendUrl: string }) {
  const itemsHtml = data.items.map((i) =>
    `<tr>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0;">${i.name}</td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.detail}</td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(i.subtotal)}</td>
    </tr>`
  ).join('');

  return `
    <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: ${BRAND_COLOR}; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 24px;">OLCA RENTAL</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Cotización ${data.quoteNumber}</h2>
        <p>Hola <strong>${data.clientName}</strong>,</p>
        <p>A continuación detallamos el presupuesto solicitado para tu próxima aventura o necesidad corporativa.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">Vehículo</th>
              <th style="padding: 12px; text-align: center; color: #64748b; font-size: 12px; text-transform: uppercase;">Detalle</th>
              <th style="padding: 12px; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 32px;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">Total con IVA</p>
          <p style="margin: 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 900;">${formatMoney(data.total)}</p>
        </div>

        <div style="text-align: center;">
          <a href="${data.frontendUrl}/cotizacion/${data.token}" 
             style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; padding: 16px 32px; border-radius: 4px; text-decoration: none; font-weight: 700; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
            Ver cotización completa
          </a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} OLCA Rental. Todos los derechos reservados.</p>
        <p style="margin: 4px 0 0;">Mendoza, Argentina.</p>
      </div>
    </div>`;
}
