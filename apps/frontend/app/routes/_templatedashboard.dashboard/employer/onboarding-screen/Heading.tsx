export default function Heading() {
    return (
        <>
            <div className="flex items-center mb-6">



                <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mr-4">
                    <span className="text-3xl font-bold">AM</span>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">Ahmad Mostafa</h1>
                    <div className="flex space-x-2 mt-2">
                        <button className="text-sm bg-gray-200 px-3 py-1 rounded-md">
                            Add Location
                        </button>
                        <button className="text-sm bg-gray-200 px-3 py-1 rounded-md">
                            Add Websites
                        </button>
                    </div>
                </div>


                <div className="ml-auto text-sm flex items-center">
                    <span>Industries Served</span>
                    <button className="ml-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m4 4h-1V9h-1m6 2h-2a9 9 0 11-18 0h2a7 7 0 1014 0z"
                            />
                        </svg>
                    </button>
                </div>

            </div>
        </>
    );
}