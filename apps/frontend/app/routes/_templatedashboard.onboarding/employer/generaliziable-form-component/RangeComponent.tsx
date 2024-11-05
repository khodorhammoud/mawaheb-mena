export default function RangeComponent({
  minVal,
  maxVal,
}: {
  minVal: number;
  maxVal: number;
}) {
  // Calculate the percentage position of the min and max values
  const minValPercent = (minVal / 40) * 100;
  const maxValPercent = (maxVal / 40) * 100;

  return (
    <div className="relative w-full flex items-center mt-4">
      {/* Slider Track */}
      <div className="relative w-full h-2 bg-blue-200 rounded-full">
        {/* Line representing min to max values */}
        <div
          className="absolute h-full bg-blue-600"
          style={{
            left: `${minValPercent}%`,
            right: `${100 - maxValPercent}%`,
          }}
        ></div>

        {/* Min Value Cursor */}
        <div
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${minValPercent}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="mb-1 flex items-center justify-center w-8 h-8 bg-gray-800 text-white text-sm rounded-full">
              {minVal}
            </div>
            <div className="w-1 h-6 bg-blue-600"></div>
          </div>
        </div>

        {/* Max Value Cursor */}
        <div
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${maxValPercent}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="mb-1 flex items-center justify-center w-8 h-8 bg-gray-800 text-white text-sm rounded-full">
              {maxVal}
            </div>
            <div className="w-1 h-6 bg-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
