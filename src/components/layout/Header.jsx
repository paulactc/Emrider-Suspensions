import logoEmrider from "../../images/Logomonoemrider.jpeg";

const Header = () => {
  return (
    <header>
      <div className="header_container">
        <a href="/index.html">
          <img className="logo_hdr" src={logoEmrider} alt="logo" />
        </a>
        <span className="vibeH">EmriderSuspensions</span>
      </div>
    </header>
  );
};
export default Header;
