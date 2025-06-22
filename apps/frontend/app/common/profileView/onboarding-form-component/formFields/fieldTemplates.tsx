import React from 'react';
import { RepeatableInputType } from '../types';
import type { FieldTemplateState, FormStateType } from '../types';
import { IoBriefcaseSharp } from 'react-icons/io5';
import { RiAwardFill } from 'react-icons/ri';
import { FaTimes, FaGraduationCap } from 'react-icons/fa';
import { parseHtmlContent } from '~/utils/api-helpers';

interface FieldTemplateProps {
  value: FormStateType | RepeatableInputType[];
  cardTitle: string;
}

const getFileType = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  return 'unknown';
};

export const TextFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    // console.log("🔍 Received Value in Template:", value); // Debugging

    if (typeof value !== 'string') {
      console.warn('⚠️ Expected string but got:', typeof value, value);
      value = JSON.stringify(value); // Ensure string type
    }

    // console.log("🛠️ [FieldTemplates] Received Value in Template:", {
    //   value,
    //   type: typeof value,
    //   isArray: Array.isArray(value),
    // });

    // console.log("🔍 [FieldTemplates] Before Parsing:", {
    //   rawValue: value,
    //   parsedValue: typeof value === "string" ? value : JSON.stringify(value),
    // });

    const { isHtml, content: sanitizedContent } = parseHtmlContent(value);

    const parsed = parseHtmlContent(value as string);
    // console.log("✅ [FieldTemplates] Parsed Content:", parsed);

    // console.log("✅ Parsed Content:", sanitizedContent); // Debugging line

    return (
      <div className="flex flex-col ">
        <span className="lg:text-lg text-base font-medium text-left">{cardTitle}</span>
        <div className="text-sm font-medium mt-4 text-gray-400 text-left">
          {isHtml ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizedContent,
              }}
            />
          ) : (
            <span>{sanitizedContent}</span>
          )}
        </div>
      </div>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col mb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const TextAreaFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-8 pl-5 pr-8">
      <span className="lg:text-lg text-base font-medium text-left">{cardTitle}</span>
      {value ? (
        <div
          className="text-sm font-medium mt-4 text-gray-600 text-left"
          dangerouslySetInnerHTML={{ __html: value as string }}
        />
      ) : (
        <span className="text-base text-gray-400 italic">Not filled</span>
      )}
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const NumberFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center justify-between pl-5 pr-8">
      <div className="flex flex-col gap-1">
        <span className="lg:text-lg text-base font-medium">{cardTitle}</span>
        <span className="lg:text-xl text-lg mt-4">{value as number} $</span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No number set</span>
    </div>
  ),
};

const Project_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    const portfolio = Array.isArray(value) ? (value as RepeatableInputType[]) : [];

    if (portfolio.length === 0) {
      return (
        <div className="flex flex-col">
          <span className="text-lg font-medium">Portfolio</span>
          <span className="text-base text-gray-400 italic">No items added</span>
        </div>
      );
    }

    return (
      <>
        <span className="lg:text-lg text-base font-medium text-left">Projects</span>
        {portfolio.map((item, index) => (
          <div key={index} className="flex flex-col text-left">
            <div className="flex w-full rounded-xl mt-4 bg-white">
              <div className="w-1/4 flex items-center justify-center bg-blue-50 rounded-l-xl min-h-[112px]">
                {(() => {
                  const fileType = getFileType(item.projectImageName || item.projectImageUrl);

                  if (fileType === 'image' && item.projectImageUrl) {
                    return (
                      <div className="relative">
                        <img
                          className="object-cover w-full h-full rounded-l-xl"
                          src={item.projectImageUrl}
                          alt={item.projectName || 'Portfolio Image'}
                        />
                        <a
                          href={item.projectImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open Image
                        </a>
                      </div>
                    );
                  }
                  if (fileType === 'pdf' && item.projectImageUrl) {
                    return (
                      <div className="relative">
                        <embed
                          src={item.projectImageUrl}
                          type="application/pdf"
                          className="object-cover w-full rounded-l-xl"
                          title={item.projectImageName}
                        />
                        <a
                          href={item.projectImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open PDF
                        </a>
                      </div>
                    );
                  }
                  if (fileType === 'word' && item.projectImageUrl) {
                    return (
                      <div className="relative">
                        <div className="relative w-full h-64 overflow-hidden rounded-l-xl">
                          <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(item.projectImageUrl)}&embedded=true`}
                            className="w-full"
                            style={{
                              height: '400px', // Make iframe tall
                              marginTop: '-50px', // Move it up to hide the bottom toolbar
                            }}
                            title={item.projectImageName}
                          />
                        </div>

                        <a
                          href={item.projectImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open in Docs
                        </a>
                      </div>
                    );
                  }
                  if (fileType === 'video' && item.projectImageUrl) {
                    return (
                      <video
                        className="w-full h-24 rounded-l-xl"
                        src={item.projectImageUrl}
                        controls
                      />
                    );
                  }
                  // Unknown or missing file, fallback
                  return (
                    <div className="flex flex-col items-center justify-center w-full h-full py-4">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" />
                      </svg>
                      <span className="text-xs mt-2 text-gray-400 text-center break-all px-2">
                        No preview
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="w-3/4 flex flex-col text-base pl-6 pr-10 py-8">
                <h1 className="xl:text-xl lg:text-lg text-base mb-4">
                  {item.projectName || 'Unnamed Project'}
                  {item.projectLink && (
                    <a
                      href={item.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Project
                    </a>
                  )}
                </h1>
                {item.projectDescription && (
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: item.projectDescription,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const WorkHistory_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    const workHistory = Array.isArray(value) ? (value as RepeatableInputType[]) : [];

    if (workHistory.length === 0) {
      return (
        <div className="flex flex-col pb-4">
          <span className="text-lg font-medium">{cardTitle}</span>
          <span className="text-base text-gray-400 italic">No items added</span>
        </div>
      );
    }

    return (
      <>
        <span className="lg:text-lg text-base font-medium text-left">Work History</span>
        {workHistory.map((item, index) => (
          <div key={index} className="flex flex-col text-left">
            <div className="flex flex-col w-full rounded-xl md:mt-4 mt-2 bg-white lg:p-6 p-4 md:gap-3 gap-1">
              <h1 className="flex items-center xl:text-xl lg:text-lg text-base mb-4 md:gap-2 gap-1">
                <IoBriefcaseSharp className="xl:h-7 lg:h-6 h-5 xl:w-7 lg:w-6 w-5 text-primaryColor p-1" />
                {item.title || 'Job Title'}
              </h1>
              <div className="flex gap-3 items-center">
                <p>{item.company || 'Company Name'}</p>
                <span className="lg:text-2xl text-xl text-gray-200 font-extralight">|</span>
                <p className="md:text-sm text-xs">
                  {new Date(item.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  -{' '}
                  {item.currentlyWorkingThere
                    ? 'Present'
                    : new Date(item.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                </p>
              </div>
              {item.jobDescription && (
                <div
                  className="md:text-sm text-xs leading-6"
                  dangerouslySetInnerHTML={{ __html: item.jobDescription }}
                />
              )}
            </div>
          </div>
        ))}
      </>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const Certificate_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    const certificates = Array.isArray(value) ? (value as RepeatableInputType[]) : [];

    if (certificates.length === 0) {
      return (
        <div className="flex flex-col pb-4">
          <span className="xl:text-lg text-base font-medium">Certificates</span>
          <span className="text-base text-gray-400 italic">No items added</span>
        </div>
      );
    }

    return (
      <>
        <span className="xl:text-lg text-base font-medium text-left">Certificates</span>
        <div className="grid grid-cols-2 xl:gap-4 gap-2 text-left">
          {certificates.map((item, index) => (
            <div
              key={index}
              className="flex flex-col w-full rounded-xl bg-white xl:p-8 lg:p-6 p-4 lg:gap-3 gap-1"
            >
              <h1 className="flex items-center xl:text-xl lg:text-lg text-base mb-4 gap-1">
                <RiAwardFill className="xl:h-6 lg:h-5 h-4 xl:w-6 lg:w-5 w-4 text-primaryColor" />
                {item.certificateName || 'Certificate Name'}
              </h1>
              <div className="flex xl:gap-3 lg:gap-2 gap-1 items-center">
                <p>{item.issuedBy || 'Issuer Name'}</p>
                <span className="xl:text-2xl lg:text-xl text-lg text-gray-200 font-extralight">
                  |
                </span>
                <p className="md:text-sm text-xs">{item.yearIssued || 'Year'}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const Education_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    const educations = Array.isArray(value) ? (value as RepeatableInputType[]) : [];

    if (!educations.length) {
      return (
        <div className="flex flex-col pb-4">
          <span className="text-lg font-medium">{cardTitle}</span>
          <span className="text-base text-gray-400 italic">No items added</span>
        </div>
      );
    }

    return (
      <>
        <span className="xl:text-lg text-base font-medium text-left">Education</span>
        <div className="grid grid-cols-2 gap-4 text-left">
          {educations.map(({ degree, institution, graduationYear }, index) => (
            <div
              key={index}
              className="flex flex-col w-full rounded-xl bg-white xl:p-8 lg:p-6 p-4 lg:gap-3 gap-2"
            >
              <h1 className="flex items-center xl:text-xl lg:text-lg text-base mb-4 gap-1">
                <FaGraduationCap className="xl:h-6 lg:h-5 h-4 xl:w-6 lg:w-5 w-4 text-primaryColor" />
                {degree ?? 'Degree Name'}
                {institution && `, ${institution}`}
              </h1>
              <div className="flex xl:gap-3 lg:gap-2 gap-1 items-center">
                <p>{institution ?? 'Institution Name'}</p>
                <span className="lg:text-2xl text-xl text-gray-200 font-extralight">|</span>
                <p className="md:text-sm text-xs">{graduationYear ?? 'Year'}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

// 2
export const IncrementFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center">
      <div className="flex flex-col gap-1">
        <span className="lg:text-lg test-base">{cardTitle}</span>
        <span className="lg:text-xl text-lg mt-4">
          {value as number} year
          {(value as number) > 1 || (value as number) == 0 ? 's' : ''}
        </span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No number set</span>
    </div>
  ),
};

// function extractYouTubeId(url: string) {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// }

export const VideoFieldTemplate: FieldTemplateState = {
  FilledState: ({ value /* cardTitle */ }: FieldTemplateProps) => {
    const videoUrl = value as string;
    // Generate thumbnail on mount for non-YouTube videos
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    // States
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [thumbnail, setThumbnail] = React.useState<string | null>(null);

    // Generate a thumbnail for non-YouTube videos
    const captureThumbnail = (url: string) => {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.currentTime = 1;

      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/png');
        setThumbnail(thumbnailUrl);
      });
    };

    React.useEffect(() => {
      if (!isYouTube) {
        captureThumbnail(videoUrl);
      }
    }, [videoUrl, isYouTube]);

    // Check if the URL is a YouTube video

    // Validate if the URL is a valid video file
    const isValidVideoUrl = (url: string) => {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];
      return videoExtensions.some(ext => url.endsWith(ext));
    };

    if (!isYouTube && !isValidVideoUrl(videoUrl)) {
      return (
        <div className="flex items-center justify-center w-full h-56 rounded-xl bg-red-100 text-red-500">
          Invalid video URL. Please provide a valid video link.
        </div>
      );
    }

    // Extract YouTube video ID for thumbnail
    const getYouTubeVideoId = (url: string) => {
      const regex =
        /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : '';
    };

    const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
      <div className="flex flex-col w-full h-auto">
        <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg">
          {/* YouTube Video Stylings */}
          {isYouTube && videoId ? (
            <button onClick={openModal} className="block w-full h-full focus:outline-none">
              <img
                className="w-full h-full object-cover"
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="YouTube Thumbnail"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primaryColor">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
              </div>
            </button>
          ) : (
            // Non-YouTube Video Stylings
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <button
                className="w-12 h-12 rounded-full flex items-center justify-center bg-primaryColor cursor-pointer"
                onClick={openModal}
                aria-label="Open video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div
              className="relative bg-primaryColor shadow-2xl max-w-4xl w-full p-7 transform scale-100 transition-all duration-300"
              style={{
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-1 -right-1 rounded-full focus:outline-none hover:scale-105 transition-transform bg-transparent"
                style={{
                  padding: '8px',
                }}
              >
                <FaTimes className="h-6 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-white hover:text-primaryColor" />
              </button>
              <div className="w-full h-64 sm:h-96 rounded-xl">
                {isYouTube && videoId ? (
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                  />
                ) : (
                  <video className="w-full h-full object-cover rounded-lg" controls autoPlay>
                    <source src={videoUrl} type="video/mp4" />
                    <track kind="captions" src="" label="English captions" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-xl font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No video added</span>
    </div>
  ),
};

export const FileFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    // Handle different types of file values
    const getFileInfo = (fileValue: any) => {
      if (fileValue instanceof File) {
        return {
          name: fileValue.name,
          size: Math.round(fileValue.size / 1024),
          type: fileValue.type,
        };
      } else if (typeof fileValue === 'string' && fileValue.startsWith('File:')) {
        // Extract file name from string representation
        const fileName = fileValue.substring(6).trim();
        return { name: fileName, size: null, type: null };
      } else if (typeof fileValue === 'object' && fileValue !== null && 'name' in fileValue) {
        // Handle file objects from the server
        return {
          name: fileValue.name,
          size: fileValue.size ? Math.round(fileValue.size / 1024) : null,
          type: fileValue.type || null,
        };
      }

      return null;
    };

    // Handle array of files or single file
    let files = [];

    if (Array.isArray(value)) {
      // Handle array of files
      files = value.map(file => getFileInfo(file)).filter(Boolean);
    } else {
      // Handle single file
      const fileInfo = getFileInfo(value);
      if (fileInfo) {
        files = [fileInfo];
      }
    }

    return (
      <div className="flex flex-col py-4 pl-5 pr-8">
        <span className="text-lg font-medium">{cardTitle}</span>

        {files.length > 0 ? (
          <div className="mt-2 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 mr-3">
                  {file.type && file.type.includes('image') ? (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ) : file.type && file.type.includes('pdf') ? (
                    <svg
                      className="w-5 h-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  {file.size && <p className="text-xs text-gray-500">{file.size} KB</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-base text-gray-400 italic">No file added</span>
        )}
      </div>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No file added</span>
    </div>
  ),
};

export const RangeFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center">
      <div className="flex flex-col gap-1">
        <span className="lg:text-lg text-base font-medium">{cardTitle}</span>
        <span className="lg:text-xl text-lg font-medium mt-4">${value as number}.00 / hour</span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic mt-4">No range set</span>
    </div>
  ),
};

export const CustomFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pb-4">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No custom field added</span>
    </div>
  ),
};

export const FieldTemplates: Record<string, FieldTemplateState> = {
  text: TextFieldTemplate,
  textArea: TextFieldTemplate,
  number: NumberFieldTemplate,
  repeatable_portfolio: Project_RepeatableFieldTemplate,
  repeatable_workHistory: WorkHistory_RepeatableFieldTemplate,
  repeatable_certificates: Certificate_RepeatableFieldTemplate,
  repeatable_educations: Education_RepeatableFieldTemplate,
  increment: IncrementFieldTemplate,
  video: VideoFieldTemplate,
  file: FileFieldTemplate,
  range: RangeFieldTemplate,
  custom: CustomFieldTemplate,
};
