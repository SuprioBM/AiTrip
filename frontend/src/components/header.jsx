import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <header
      className="
        fixed top-4 left-1/2 -translate-x-1/2 
        z-50 
        backdrop-blur-lg bg-white/10 
        border border-white/20
        rounded-full 
        w-[95%]
      "
    >
      <div
        className="max-w-7xl mx-auto px-6 py-3 
                      flex items-center"
      >
        {/* LEFT — NAVIGATION */}
        <nav
          className="
          flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 
          text-black font-medium text-sm sm:text-base
        "
        >
          {["News", "Destinations", "Blog", "Contact"].map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-blue-200 transition whitespace-nowrap"
              style={{
                animation: `navItemSlideDown 0.5s ease-out ${
                  0.1 + idx * 0.06
                }s both`,
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* RIGHT — SEARCH + PROFILE + LOGOUT */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-end ml-80">
          {/* Search Bar (NO BLUR) */}
          <div
            className="
    hidden lg:flex items-center
    text-black
    bg-[#E0F7FA]   /* Pure water/light cyan background */
    border border-white/40
    rounded-full px-4 py-2
    w-48 xl:w-72 shadow-md
  "
            style={{ animation: "navItemSlideDown 0.5s ease-out 0.2s both" }}
          >
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 outline-none bg-transparent text-sm text-black"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="w-4 h-4 text-teal-600"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          {/* Profile Button */}
          <button
            className="
              flex items-center gap-2 
              bg-teal-500/80 text-black 
              px-5 py-2.5 
              rounded-full hover:bg-teal-600 
              transition shadow-md
            "
            style={{ animation: "iconPopScale 0.6s ease-out 0.25s both" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="font-medium hidden sm:inline">
              Hello, {user ? user.email.split("@")[0] : "Guest"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              bg-teal-500/80 text-black 
              px-5 py-2.5 
              rounded-full hover:bg-teal-600 
              transition shadow-md
            "
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
