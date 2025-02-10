export default function SkillsFilter() {
  return (
    <button
      className="border border-gray-300 text-primaryColor bg-white rounded-[10px] px-3 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transitionb not-active-gradient text-sm leading-4"
      onClick={() =>
        console.log(
          "Skills button clicked! (Functionality will be added later)"
        )
      }
    >
      Skills
    </button>
  );
}
