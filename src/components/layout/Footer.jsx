import logoEmrider from "/images/Logomonoemrider.jpeg";

function Footer() {
  return (
    <>
      <footer>
        <p className="vm">EmriderSuspensions © 2025</p>

        <div className="rrss">
          <a href="https://www.facebook.com" className="rrss_link">
            <i className="fb fa-brands fa-facebook-f fa-1x"></i>
          </a>
          <a href="https://www.twitter.com" className="rrss_link">
            <i className="tw fa-brands fa-twitter fa-1x"></i>
          </a>
          <a href="https://www.instagram.com" className="rrss_link">
            <i className="fa-brands fa-instagram fa-1x"></i>
          </a>
          <img className="logofooter" src={logoEmrider} alt="logofooter" />
        </div>
      </footer>
    </>
  );
}

export default Footer;
