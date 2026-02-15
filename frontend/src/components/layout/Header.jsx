import logoEmrider from "/images/Logomonoemrider.jpeg";
import { Link, NavLink } from "react-router";

const Header = () => {
  return (
    <header>
      <div className="header_container">
        <NavLink to="/">
          <img className="logo_hdr" src={logoEmrider} alt="logo" />
        </NavLink>
        <span className="vibeH">EmRider Garage</span>
      </div>
    </header>
  );
};
export default Header;
