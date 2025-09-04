import React from "react";

const spinnerStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  border: "5px solid #e0e0e0",
  borderTop: "5px solid #4f8cff", // Use your accent color here
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  boxShadow: "0 2px 12px rgba(79,140,255,0.15)",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "180px",
  width: "100%",
};

const spinnerKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
`;

const Loading: React.FC = () => (
  <div style={containerStyle}>
    <style>{spinnerKeyframes}</style>
    <div style={spinnerStyle} />
  </div>
);

export default Loading;
