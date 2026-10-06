import { Component } from "react";
import C from "../../shared/config.js";

/** Kisi hisse mein koi bug aaye to poori site safed na ho — sirf wahi hissa badal jaye aur call ka button dikhe */
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { try { navigator.sendBeacon?.("/api/health", JSON.stringify({ e: String(error?.message || error).slice(0, 200) })); } catch { /* */ } }
  render() {
    if (!this.state.failed) return this.props.children;
    return this.props.silent ? null : (
      <div role="alert" style={{ padding: "1.4rem", margin: "1rem", background: "#FFF6DF", color: "#0E3B2A", borderRadius: 20, fontWeight: 600 }}>
        Is hisse mein dikkat aayi. <button type="button" onClick={() => this.setState({ failed: false })} style={{ font: "inherit", textDecoration: "underline", background: "none", border: 0, color: "inherit", cursor: "pointer" }}>Dobara try karo</button>
        {" "}ya call karo: <a href={`tel:+91${C.contact.phone}`}>{C.contact.phone}</a>
      </div>
    );
  }
}
