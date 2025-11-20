import "./snackbar.css";

export default function GlobalSnackbar({ open, type, message }) {
  return (
    <div className={`snackbar ${open ? "show" : ""} ${type}`}>
      <div className="snackbar__icon">
        {type === "error" && "❌"}
        {type === "warning" && "⚠️"}
        {type === "info" && "ℹ️"}
      </div>

      <span className="snackbar__message">{message}</span>
    </div>
  );
}
