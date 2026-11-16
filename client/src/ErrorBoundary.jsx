import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Lỗi giao diện:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          maxWidth: 760,
          margin: "40px auto",
          padding: 24,
          color: "#f4f1ff",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Có lỗi xảy ra 😢</h2>
        <p>Hãy chụp màn hình này gửi cho người hỗ trợ, rồi bấm tải lại trang.</p>
        <pre
          style={{
            padding: 14,
            overflow: "auto",
            fontSize: 13,
            borderRadius: 12,
            background: "rgba(0,0,0,0.4)",
            whiteSpace: "pre-wrap",
          }}
        >
          {String(this.state.error?.stack || this.state.error)}
        </pre>
        <button
          style={{ padding: "10px 18px", fontSize: 15, cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </button>
      </div>
    );
  }
}