import "./LoadingSpinner.css";

interface Props {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  fullPage = false,
  text,
}: Props) {
  const spinner = (
    <div className={`spinner spinner--${size}`}>
      <div className="spinner__ring" />
      {text && <p className="spinner__text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="spinner-page">{spinner}</div>;
  }

  return spinner;
}
