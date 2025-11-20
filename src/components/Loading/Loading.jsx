import "./loading.css";

const Loading = ({ type = "bar" }) => {
  if (type === "spinner") {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // default: "bar"
  return (
    <div className="loading-container">
      <div className="loading-bar"></div>
    </div>
  );
};

export default Loading;
