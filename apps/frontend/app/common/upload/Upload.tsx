import { FaUpload } from "react-icons/fa";

export default function Upload() {
  return (
    <div className="flex flex-col items-center border border-dashed border-gray-400 bg-gray-100 p-3 rounded-xl font-['Switzer-Light']">
      <button className="not-active-gradient text-white bg-primaryColor rounded-xl transition-all p-2 cursor-pointer mb-4 mt-2">
        <FaUpload className="w-3 h-3" />
      </button>
      <div className="text-[14px]">
        <div className="inline text-primaryColor">Click to Upload</div> or drag
        and drop
      </div>
      <div className="text-[11px] mb-1">(Max. File size: 25 MB)</div>
    </div>
  );
}
