export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} Heang Denis. All rights reserved.
          </p>
          <p className="footer__credit">Data Science Portfolio</p>
        </div>
      </div>
    </footer>
  );
}
