import { Outlet } from "react-router-dom";
import Footer from "./Footer";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
