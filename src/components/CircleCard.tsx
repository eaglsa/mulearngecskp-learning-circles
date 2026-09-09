import { Link } from "react-router-dom";
import type { Circle } from "../types/circle";
import StatusBadge from "./StatusBadge";
import "./CircleCard.css";

interface Props {
  circle: Circle;
  participantCount?: number;
}

// Deterministic gradient based on topic name
function topicGradient(topic: string): string {
  const hue = Math.abs(
    topic.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  );
  return `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 40) % 360}, 75%, 45%))`;
}

// First letter(s) for the topic icon
function topicInitials(topic: string): string {
  return topic
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CircleCard({ circle, participantCount }: Props) {
  return (
    <Link to={`/circles/${circle.id}`} className="circle-card card" tabIndex={0}>
      {/* Coloured header strip */}
      <div
        className="circle-card__header"
        style={{ background: topicGradient(circle.topic) }}
      >
        <div className="circle-card__icon">{topicInitials(circle.topic)}</div>
        <StatusBadge status={circle.status} />
      </div>

      {/* Body */}
      <div className="circle-card__body">
        <h3 className="circle-card__name">{circle.name}</h3>
        <span className="circle-card__topic tag">{circle.topic}</span>
        <p className="circle-card__desc">{circle.description}</p>

        <div className="circle-card__footer">
          <div className="circle-card__host">
            <div className="circle-card__host-avatar">
              {circle.hostName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="circle-card__host-name">{circle.hostName}</div>
              <div className="circle-card__host-dept">{circle.hostDepartment}</div>
            </div>
          </div>

          {participantCount !== undefined && (
            <div className="circle-card__count">
              <span className="circle-card__count-num">{participantCount}</span>
              <span className="circle-card__count-label">members</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
