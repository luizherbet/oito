from app.settings import settings
import httpx

MAILERSEND_API_URL = "https://api.mailersend.com/v1/email"


def render_email_layout(title: str, subtitle: str, body_html: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

                <tr>
                  <td style="padding:24px 24px 12px 24px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
                    <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#6d28d9;">
                      Oito
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 24px 12px 24px;">
                    <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7c3aed;margin-bottom:8px;">
                      Notificação
                    </div>
                    <h1 style="margin:0;font-size:24px;line-height:1.3;color:#0f172a;">
                      {title}
                    </h1>
                    <p style="margin:12px 0 0 0;font-size:14px;line-height:1.6;color:#475569;">
                      {subtitle}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 24px 24px 24px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
                      {body_html}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 24px;background:#fafafa;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                      Esta é uma notificação automática do Oito.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def send_email(to_email: str, to_name: str, subject: str, text: str, html: str) -> None:
    token = settings.mailersend_api_token
    from_email = settings.mailersend_from_email
    from_name = settings.mailersend_from_name

    payload = {
        "from": {
            "email": from_email,
            "name": from_name,
        },
        "to": [
            {
                "email": to_email,
                "name": to_name,
            }
        ],
        "subject": subject,
        "text": text,
        "html": html,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = httpx.post(
        MAILERSEND_API_URL,
        json=payload,
        headers=headers,
        timeout=10.0,
    )

    if response.status_code != 202:
        raise RuntimeError(f"MailerSend error: {response.status_code} - {response.text}")


def send_appointment_created_email(
    to_email: str,
    to_name: str,
    counterpart_name: str,
    service_title: str,
    appointment_date: str,
    appointment_time: str,
) -> None:
    subject = "Agendamento criado"

    text = (
        f"Olá, {to_name}. "
        f"O agendamento de {service_title} com {counterpart_name} foi criado para "
        f"{appointment_date} às {appointment_time}."
    )

    body_html = f"""
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
      Olá, <strong>{to_name}</strong>.
    </p>

    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#334155;">
      O seu agendamento foi registado com sucesso.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Serviço</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{service_title}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Com</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{counterpart_name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Data</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_date}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Hora</td>
        <td style="padding:10px 0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_time}</td>
      </tr>
    </table>
    """

    html = render_email_layout(
        title="Agendamento criado",
        subtitle="O seu horário foi registado no Oito.",
        body_html=body_html,
    )

    send_email(to_email, to_name, subject, text, html)


def send_appointment_confirmed_email(
    to_email: str,
    to_name: str,
    counterpart_name: str,
    service_title: str,
    appointment_date: str,
    appointment_time: str,
) -> None:
    subject = "Agendamento confirmado"

    text = (
        f"Olá, {to_name}. "
        f"O agendamento de {service_title} com {counterpart_name} foi confirmado para "
        f"{appointment_date} às {appointment_time}."
    )

    body_html = f"""
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
      Olá, <strong>{to_name}</strong>.
    </p>

    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#334155;">
      O seu agendamento foi confirmado.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Serviço</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{service_title}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Com</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{counterpart_name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Data</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_date}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Hora</td>
        <td style="padding:10px 0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_time}</td>
      </tr>
    </table>
    """

    html = render_email_layout(
        title="Agendamento confirmado",
        subtitle="O horário foi confirmado no Oito.",
        body_html=body_html,
    )

    send_email(to_email, to_name, subject, text, html)


def send_appointment_cancelled_email(
    to_email: str,
    to_name: str,
    counterpart_name: str,
    service_title: str,
    appointment_date: str,
    appointment_time: str,
) -> None:
    subject = "Agendamento cancelado"

    text = (
        f"Olá, {to_name}. "
        f"O agendamento de {service_title} com {counterpart_name}, marcado para "
        f"{appointment_date} às {appointment_time}, foi cancelado."
    )

    body_html = f"""
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
      Olá, <strong>{to_name}</strong>.
    </p>

    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#334155;">
      O seu agendamento foi cancelado.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Serviço</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{service_title}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Com</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{counterpart_name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Data</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_date}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Hora</td>
        <td style="padding:10px 0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_time}</td>
      </tr>
    </table>
    """

    html = render_email_layout(
        title="Agendamento cancelado",
        subtitle="O agendamento foi cancelado no Oito.",
        body_html=body_html,
    )

    send_email(to_email, to_name, subject, text, html)


def send_appointment_rescheduled_email(
    to_email: str,
    to_name: str,
    counterpart_name: str,
    service_title: str,
    appointment_date: str,
    appointment_time: str,
) -> None:
    subject = "Agendamento reagendado"

    text = (
        f"Olá, {to_name}. "
        f"O agendamento de {service_title} com {counterpart_name} foi reagendado para "
        f"{appointment_date} às {appointment_time}."
    )

    body_html = f"""
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
      Olá, <strong>{to_name}</strong>.
    </p>

    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#334155;">
      O seu agendamento foi reagendado.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Serviço</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{service_title}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Com</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{counterpart_name}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Nova data</td>
        <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_date}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#64748b;">Nova hora</td>
        <td style="padding:10px 0;font-size:14px;color:#0f172a;font-weight:600;" align="right">{appointment_time}</td>
      </tr>
    </table>
    """

    html = render_email_layout(
        title="Agendamento reagendado",
        subtitle="O horário foi atualizado no Oito.",
        body_html=body_html,
    )

    send_email(to_email, to_name, subject, text, html)