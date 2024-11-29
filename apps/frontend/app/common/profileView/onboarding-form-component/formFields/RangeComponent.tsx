export default function RangeComponent({
  minVal,
  maxVal,
}: {
  minVal: number;
  maxVal: number;
}) {
  const rightBorderSize = maxVal * 1.3;
  // Calculate the percentage position of the min and max values
  const minValPercent = (minVal / rightBorderSize) * 100;
  const maxValPercent = (maxVal / rightBorderSize) * 100;

  return (
    <div className="relative w-full flex items-center mt-8">
      {/* Slider Track */}
      <div className="relative w-full sm:h-3 h-2 bg-blue-100 rounded-full">
        {/* Line representing min to max values */}
        <div
          className="absolute h-full bg-primaryColor"
          style={{
            left: `${minValPercent}%`,
            right: `${100 - maxValPercent}%`,
          }}
        ></div>

        <div className="flex">
          {/* . left */}
          <div className="absolute left-0 w-1 h-1 bg-primaryColor text-sm rounded-full sm:mt-1 mt-[2px] ml-1"></div>

          {/* right . */}
          <div className="absolute right-0 w-1 h-1 bg-primaryColor text-sm rounded-full sm:mt-1 mt-[2px] mr-1"></div>
        </div>

        {/* Min Value Cursor */}
        <div
          className="absolute -bottom-4 transform -translate-x-1/2"
          style={{ left: `${minValPercent}%` }}
        >
          {/* 1st the black ball */}
          <div className="flex flex-col items-center">
            <div className="mb-2 flex items-center justify-center w-9 h-8 bg-black text-white text-sm rounded-full">
              {minVal}
            </div>
            <div className="w-1 h-11 bg-primaryColor rounded-xl"></div>
          </div>
        </div>

        {/* Max Value Cursor */}
        <div
          className="absolute -bottom-4 transform -translate-x-1/2"
          style={{ left: `${maxValPercent}%` }}
        >
          {/* 2nd the black ball */}
          <div className="flex flex-col items-center">
            <div className="mb-2 flex items-center justify-center w-9 h-8 bg-black text-white text-sm rounded-full">
              {maxVal}
            </div>
            <div className="w-1 h-11 bg-primaryColor rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
