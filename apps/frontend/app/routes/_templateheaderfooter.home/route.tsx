// that route.tsx calls home :)

import Home from "./home";
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Home />
    </div>
  );
}
