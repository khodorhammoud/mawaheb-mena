import IndustriesServed from "./industries-served";
import BioInfo from "./bio-info";
export default function Heading() {
  return (
    <>
      <div className="flex items-center mb-6">
        {/* Bio Info ✏️ */}
        <BioInfo />

        {/* Industries Served ✏️ */}
        <IndustriesServed />
      </div>
    </>
  );
}
