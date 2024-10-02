import Home from "~/routes/_templateheaderfooter.for-employers/Home";

export default function Layout() {
  return (
    <div
      className="container"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <Home />
    </div>
  );
}
