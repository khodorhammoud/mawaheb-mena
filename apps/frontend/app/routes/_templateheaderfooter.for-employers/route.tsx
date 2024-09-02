// that route.tsx calls home :)

import Home from "./Home";
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Home />
    </div>
  );
}
