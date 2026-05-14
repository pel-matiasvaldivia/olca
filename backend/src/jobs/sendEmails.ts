import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

export async function sendQuoteEmail(quoteId: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn(`Email NO enviado para cotización ${quoteId}: Credenciales SMTP no configuradas.`);
    return;
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });
    if (!quote) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const itemsHtml = quote.items.map((i) =>
      `<tr><td>${i.productoNombre}</td><td>${i.cantidad} x ${i.diasAlquiler}d</td><td>${formatMoney(i.subtotal)}</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f0;padding:32px;border-radius:12px;">
        <h1 style="color:#e8b84b;">OLCA RENTAL</h1>
        <h2>Cotización ${quote.numero}</h2>
        <p>Hola <strong>${quote.clienteNombre}</strong>, tu cotización fue generada exitosamente.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="color:#e8b84b;"><th>Vehículo</th><th>Detalle</th><th>Subtotal</th></tr>
          ${itemsHtml}
        </table>
        <h3 style="color:#e8b84b;text-align:right;">Total: ${formatMoney(quote.total)}</h3>
        <a href="${frontendUrl}/cotizacion/${quote.tokenPublico}" style="background:#e8b84b;color:#0a0a0f;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Ver cotización</a>
      </div>`;

    await transporter.sendMail({
      from: `"OLCA Rental" <${process.env.SMTP_USER}>`,
      to: quote.clienteEmail,
      subject: `Tu cotización ${quote.numero} — OLCA Rental`,
      html,
    });

    logger.info(`✉️  Email enviado para ${quote.numero}`);
  } catch (err) {
    logger.error('Error sending quote email:', err);
  }
}
