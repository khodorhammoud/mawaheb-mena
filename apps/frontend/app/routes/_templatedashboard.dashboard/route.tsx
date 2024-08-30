import FreelancerContent from "./Freelancers";
import EmployerContent from "./Employers";
export default function Layout() {
  const currentUserType = "freelancer";
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="w-full bg-white flex flex-col justify-center items-center p-8 mt-12">
        {currentUserType === "freelancer" ? (
          <FreelancerContent />
        ) : (
          <EmployerContent />
        )}
      </div>
    </div>
  );
}
