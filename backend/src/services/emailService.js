const nodemailer = require("nodemailer");

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Recuperar contraseña - Emrider Suspensions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333;">Emrider Suspensions</h1>
        </div>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Recuperar contraseña</h2>
          <p style="color: #555; line-height: 1.6;">
            Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #e53935; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">
            Si no solicitaste este cambio, ignora este email. El enlace expira en 1 hora.
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Si el boton no funciona, copia y pega este enlace en tu navegador:<br/>
            <a href="${resetUrl}" style="color: #e53935;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email de recuperacion enviado a:", email);
}

async function sendSugerenciaEmail({ cif, nombre, mensaje }) {
  const remitente = nombre || cif || "Cliente desconocido";

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: "info@emrider.es",
    subject: `[EmRider] Sugerencia/Incidencia de ${remitente}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fbbf24; margin: 0;">EmRider Garage</h1>
          <p style="color: #888; margin: 4px 0 0;">Nueva sugerencia o incidencia recibida</p>
        </div>
        <div style="background: #1f2937; border-radius: 10px; padding: 24px; border: 1px solid #374151;">
          <p style="color: #9ca3af; margin: 0 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .05em;">Cliente</p>
          <p style="color: #f9fafb; margin: 0 0 20px; font-weight: 600;">${remitente}${cif ? ` · <span style="color:#9ca3af">${cif}</span>` : ""}</p>
          <p style="color: #9ca3af; margin: 0 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .05em;">Mensaje</p>
          <p style="color: #f9fafb; margin: 0; line-height: 1.65; white-space: pre-wrap;">${mensaje}</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email de sugerencia enviado al admin");
}

module.exports = { sendPasswordResetEmail, sendSugerenciaEmail };
