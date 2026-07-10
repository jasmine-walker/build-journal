import { FileText, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-credit">
        Built by{" "}
        <a href="https://jasminejwalker.com" target="_blank" rel="noreferrer">
          Jasmine Walker
        </a>
      </p>
      <div className="footer-links">
        <a className="footer-link" href="https://jasminejwalker.com" target="_blank" rel="noreferrer">
          <FileText size={15} /> Resume
        </a>
        <a className="footer-link" href="https://github.com/jasmine-walker" target="_blank" rel="noreferrer">
          <Github size={15} /> GitHub
        </a>
        <a className="footer-link" href="https://linkedin.com/in/jasminejwalker" target="_blank" rel="noreferrer">
          <Linkedin size={15} /> LinkedIn
        </a>
      </div>
    </footer>
  );
}
