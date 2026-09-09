import { QRCodeSVG } from "qrcode.react";
import "./ContactHostCard.css";

interface Props {
  hostName: string;
  hostContact: string;
  hostContactType?: "phone" | "email" | "whatsapp";
}

function buildHref(contact: string, type: "phone" | "email" | "whatsapp"): string {
  switch (type) {
    case "phone":
      // strip spaces/dashes so tel: links work reliably
      return `tel:${contact.replace(/[\s\-()]/g, "")}`;
    case "email":
      return `mailto:${contact}`;
    case "whatsapp": {
      // Accept raw number or existing wa.me URL
      if (contact.startsWith("https://") || contact.startsWith("http://")) {
        return contact;
      }
      const num = contact.replace(/\D/g, "");
      return `https://wa.me/${num}`;
    }
  }
}

const typeLabel: Record<"phone" | "email" | "whatsapp", string> = {
  phone:    "📞 Call / SMS",
  email:    "✉️ Send Email",
  whatsapp: "💬 Message on WhatsApp",
};

export default function ContactHostCard({ hostName, hostContact, hostContactType }: Props) {
  // ── Fallback for old docs with no hostContactType ──
  if (!hostContactType) {
    return (
      <div className="chc">
        <p className="chc__plain-label">Contact {hostName}</p>
        <p className="chc__plain-value">{hostContact}</p>
      </div>
    );
  }

  const href = buildHref(hostContact, hostContactType);

  return (
    <div className="chc">
      <a
        href={href}
        target={hostContactType === "whatsapp" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="btn btn-primary chc__btn"
        id="contact-host-btn"
      >
        {typeLabel[hostContactType]}
      </a>

      <div className="chc__qr-wrap">
        <p className="chc__qr-label">Scan to contact</p>
        <QRCodeSVG
          value={href}
          size={120}
          bgColor="transparent"
          fgColor="var(--ml-purple-900)"
          level="M"
        />
      </div>
    </div>
  );
}
