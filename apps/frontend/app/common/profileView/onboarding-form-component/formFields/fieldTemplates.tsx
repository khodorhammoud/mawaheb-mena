// NOTE: Image previews use projectImageUrl / projectImageName
//       PDF previews use attachmentUrl / attachmentName
//       Word previews use projectImageUrl (assume .docx stored as image field?)
//       Never mix the two!
//       If you see "No preview" for a file type, check the field mappings!

import React from 'react';
import { RepeatableInputType } from '../types';
import type { FieldTemplateState, FormStateType } from '../types';
import { IoBriefcaseSharp } from 'react-icons/io5';
import { RiAwardFill } from 'react-icons/ri';
import { FaTimes, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { parseHtmlContent } from '~/utils/api-helpers';

interface FieldTemplateProps {
  value: FormStateType | RepeatableInputType[];
  cardTitle: string;
}

export const getFileType = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  return 'unknown';
};

function isValidUrl(url) {
  return typeof url === 'string' && url.startsWith('https://');
}

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

    const [openImageIndex, setOpenImageIndex] = React.useState<number | null>(null);
    const [openPdfIndex, setOpenPdfIndex] = React.useState<number | null>(null);
    const [openWordIndex, setOpenWordIndex] = React.useState<number | null>(null);
    const [openVideoIndex, setOpenVideoIndex] = React.useState<number | null>(null);

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
              {/* Portfolios Photo */}
              <div className="w-1/4 flex items-center justify-center bg-blue-50 rounded-l-xl min-h-[112px]">
                {(() => {
                  let fileType = '';
                  let displayUrl = '';
                  let displayName = '';

                  if (
                    item.projectImageUrl &&
                    getFileType(item.projectImageName || item.projectImageUrl) === 'image'
                  ) {
                    fileType = 'image';
                    displayUrl = item.projectImageUrl;
                    displayName = item.projectImageName;

                    // console.log('attachmentUrl:', item.attachmentUrl);
                    // console.log('displayUrl:', displayUrl);
                  } else if (
                    item.attachmentUrl &&
                    getFileType(item.attachmentName || item.attachmentUrl) === 'pdf'
                  ) {
                    fileType = 'pdf';
                    displayUrl = item.attachmentUrl;
                    displayName = item.attachmentName;
                  } else if (
                    item.projectImageUrl &&
                    getFileType(item.projectImageName || item.projectImageUrl) === 'word'
                  ) {
                    fileType = 'word';
                    displayUrl = item.projectImageUrl;
                    displayName = item.projectImageName;
                  }

                  // FOR IMAGES
                  if (fileType === 'image' && displayUrl) {
                    return (
                      <div className="relative">
                        <img
                          className="object-cover w-full h-full rounded-l-xl"
                          src={item.projectImageUrl}
                          alt={item.projectName || 'Portfolio Image'}
                        />
                        <button
                          type="button"
                          onClick={() => setOpenImageIndex(index)}
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open Image
                        </button>
                      </div>
                    );
                  }

                  // FOR PDF's
                  if (fileType === 'pdf' && displayUrl) {
                    // console.log('PDF previewing:', item.attachmentUrl);

                    const pdfUrl = item.attachmentUrl || item.projectImageUrl; // fallback just in case

                    return (
                      <div className="relative">
                        <embed
                          src={displayUrl}
                          type="application/pdf"
                          className="object-cover w-full rounded-l-xl"
                          title={displayUrl}
                        />
                        <button
                          type="button"
                          onClick={() => setOpenPdfIndex(index)}
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open PDF
                        </button>
                      </div>
                    );
                  }

                  // FOR WORD DOCUMENTS
                  if (fileType === 'word' && displayUrl && isValidUrl(displayUrl)) {
                    // Case 1: File has a public URL, preview with Google Docs
                    return (
                      <div className="relative">
                        <div className="relative w-full h-64 overflow-hidden rounded-l-xl">
                          <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(item.projectImageUrl)}&embedded=true`}
                            className="w-full"
                            style={{
                              height: '400px',
                              marginTop: '-50px',
                            }}
                            title={item.projectImageName}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenWordIndex(index)}
                          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 text-xs"
                        >
                          Open in Docs
                        </button>
                      </div>
                    );
                  } else if (fileType === 'word') {
                    // Case 2: File just uploaded, not yet saved. Show spinner or message.
                    return (
                      <div className="flex flex-col items-center justify-center w-full h-full py-4">
                        <svg
                          className="w-10 h-10 text-gray-400 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span className="text-xs mt-2 text-gray-400 text-center break-all px-2">
                          Uploading Word document...
                        </span>
                        <span className="text-xs mt-2 text-gray-400 text-center break-all px-2">
                          Please save to preview it from here
                        </span>
                      </div>
                    );
                  }

                  // FOR VIDEOS (not tested till now + idk if we need it)
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

              {/* Portfolios Main Content: (Title - View Project Button - Description) */}
              <div className="w-3/4 flex flex-col text-base pl-6 pr-10 py-8">
                {/* TITLE + VIEW PROJECT */}
                <div className="flex justify-between items-center w-full">
                  {/* TIILE */}
                  <h1 className="xl:text-xl lg:text-lg text-base mb-4 flex break-all">
                    {item.projectName || 'Unnamed Project'}
                  </h1>
                  {/* VIEW PROJECT */}
                  <h1 className="xl:text-xl lg:text-lg text-base self-start mt-1">
                    {item.projectLink && (
                      <a
                        href={item.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 group text-primaryColor text-sm ml-4 underline hover:opacity-90 transition whitespace-nowrap"
                      >
                        View Project
                        <FaArrowRight className="w-2 h-3 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </h1>
                </div>
                {/* DESCRIPTION */}
                <div className="">
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
          </div>
        ))}

        {/* Project Image Popup (Modal) */}
        {openImageIndex !== null && portfolio[openImageIndex]?.projectImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="relative bg-white shadow-2xl max-w-3xl w-full p-6 rounded-lg">
              {/* Close Button */}
              <button
                onClick={() => setOpenImageIndex(null)}
                className="absolute top-2 right-2 rounded-full focus:outline-none hover:scale-105 transition-transform bg-gray-200"
                style={{ padding: '6px' }}
              >
                <FaTimes className="h-5 w-5 text-gray-800" />
              </button>
              <div className="w-full flex justify-center items-center min-h-[50vh]">
                <img
                  src={portfolio[openImageIndex].projectImageUrl}
                  alt={portfolio[openImageIndex].projectName || 'Project Image'}
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow"
                />
              </div>
            </div>
          </div>
        )}

        {/* Project PDF Popup (Modal) */}
        {openPdfIndex !== null &&
          (portfolio[openPdfIndex]?.attachmentUrl || portfolio[openPdfIndex]?.projectImageUrl) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="relative bg-white shadow-2xl max-w-3xl w-full p-6 rounded-lg">
                <button
                  onClick={() => setOpenPdfIndex(null)}
                  className="absolute top-2 right-2 rounded-full focus:outline-none hover:scale-105 transition-transform bg-gray-200"
                  style={{ padding: '6px' }}
                >
                  <FaTimes className="h-5 w-5 text-gray-800" />
                </button>
                <div className="w-full h-[80vh]">
                  <embed
                    src={
                      portfolio[openPdfIndex].attachmentUrl ||
                      portfolio[openPdfIndex].projectImageUrl
                    }
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

        {/* Project Word Popup (Modal) */}
        {openWordIndex !== null && portfolio[openWordIndex]?.projectImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="relative bg-white shadow-2xl max-w-3xl w-full p-6 rounded-lg">
              <button
                onClick={() => setOpenWordIndex(null)}
                className="absolute top-2 right-2 rounded-full focus:outline-none hover:scale-105 transition-transform bg-gray-200"
                style={{ padding: '6px' }}
              >
                <FaTimes className="h-5 w-5 text-gray-800" />
              </button>
              <div className="w-full h-[80vh]">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(portfolio[openWordIndex].projectImageUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg"
                  title="Word Document"
                />
              </div>
            </div>
          </div>
        )}
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
              <div className="flex gap-4">
                <h1>
                  <IoBriefcaseSharp className="xl:h-7 lg:h-6 h-5 xl:w-7 lg:w-6 w-5 text-primaryColor p-1" />
                </h1>
                <h1 className="xl:text-xl lg:text-lg text-base mb-4 break-all">
                  {item.title || 'Job Title'}
                </h1>
              </div>

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
              <div className="flex gap-4">
                <h1>
                  <RiAwardFill className="xl:h-6 lg:h-5 h-4 xl:w-6 lg:w-5 w-4 mt-[2px] text-primaryColor" />
                </h1>
                <h1 className="xl:text-xl lg:text-lg text-base mb-4 break-all">
                  {item.certificateName || 'Certificate Name'}
                </h1>
              </div>

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
              <div className="flex gap-4">
                <h1>
                  <FaGraduationCap className="xl:h-6 lg:h-5 h-4 xl:w-6 mt-[2px] lg:w-5 w-4 text-primaryColor" />
                </h1>
                <h1 className="xl:text-xl lg:text-lg text-base mb-4 break-all">
                  {degree ?? 'Degree Name'}
                  {institution && `, ${institution}`}
                </h1>
              </div>

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

export const VideoFieldTemplate: FieldTemplateState = {
  FilledState: ({ value /* cardTitle */ }: FieldTemplateProps) => {
    // States - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [thumbnail, setThumbnail] = React.useState<string | null>(null);
    const [videoUrl, setVideoUrl] = React.useState<string>('');
    const [isLoadingVideo, setIsLoadingVideo] = React.useState(false);
    const [videoError, setVideoError] = React.useState<string | null>(null);

    const videoData = React.useMemo(() => {
      if (typeof value === 'string' && value.trim()) {
        // Legacy format - assume it's a YouTube link
        return {
          videoType: 'link' as const,
          videoLink: value,
          videoAttachmentId: null,
        };
      } else if (typeof value === 'object' && value !== null) {
        // New format - object with videoType, videoLink, videoAttachmentId
        const videoType = (value as any).videoType || 'link';
        const videoLink = (value as any).videoLink || '';
        const videoAttachmentId = (value as any).videoAttachmentId || null;

        // Return the data if we have either a link or an attachment
        if (
          (videoType === 'link' && videoLink.trim()) ||
          (videoType === 'attachment' && videoAttachmentId)
        ) {
          return {
            videoType,
            videoLink,
            videoAttachmentId,
          };
        }
      }
      return null;
    }, [value]);

    console.log('VideoFieldTemplate videoData:', videoData);

    // Check if it's a YouTube video
    const isYouTube = React.useMemo(() => {
      if (videoData?.videoType === 'link' && videoData.videoLink) {
        return (
          videoData.videoLink.includes('youtube.com') || videoData.videoLink.includes('youtu.be')
        );
      }
      return false;
    }, [videoData]);

    // Fetch presigned URL for attachment videos
    const fetchPresignedUrl = React.useCallback(async (attachmentId: number) => {
      try {
        setIsLoadingVideo(true);
        setVideoError(null);

        const response = await fetch(`/api/attachments/${attachmentId}/presigned-url`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch presigned URL');
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error('Error fetching presigned URL:', error);
        setVideoError('Failed to load video');
        throw error;
      } finally {
        setIsLoadingVideo(false);
      }
    }, []);

    // Generate a thumbnail for non-YouTube videos
    const captureThumbnail = React.useCallback((url: string) => {
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
    }, []);

    // Set up video URL based on video type
    React.useEffect(() => {
      if (!videoData) return;

      if (videoData.videoType === 'link') {
        // For link type, use the videoLink directly
        setVideoUrl(videoData.videoLink);
      } else if (videoData.videoType === 'attachment' && videoData.videoAttachmentId) {
        // For attachment type, fetch presigned URL
        fetchPresignedUrl(videoData.videoAttachmentId)
          .then(url => setVideoUrl(url))
          .catch(() => setVideoUrl(''));
      }
    }, [videoData, fetchPresignedUrl]);

    React.useEffect(() => {
      if (!isYouTube && videoUrl && typeof videoUrl === 'string') {
        captureThumbnail(videoUrl);
      }
    }, [videoUrl, isYouTube, captureThumbnail]);

    // If no valid video data, show empty state (AFTER all hooks)
    if (!videoData) {
      return (
        <div className="flex flex-col pb-4">
          <span className="text-xl font-medium">Video</span>
          <span className="text-base text-gray-400 italic">No video added</span>
        </div>
      );
    }

    // Validate if the URL is a valid video file for non-YouTube videos
    const isValidVideoUrl = (url: string) =>
      typeof url === 'string' &&
      ['.mp4', '.webm', '.ogg', '.mov', '.mkv'].some(ext => url.toLowerCase().endsWith(ext));

    // Handle loading state
    if (isLoadingVideo) {
      return (
        <div className="flex items-center justify-center w-full h-56 rounded-xl bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor"></div>
            <span className="text-sm text-gray-600">Loading video...</span>
          </div>
        </div>
      );
    }

    // Handle error state
    if (videoError) {
      return (
        <div className="flex items-center justify-center w-full h-56 rounded-xl bg-red-100 text-red-500">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-sm">{videoError}</span>
          </div>
        </div>
      );
    }

    // Handle invalid video URL for non-YouTube, non-attachment videos
    if (!isYouTube && videoData?.videoType === 'link' && !isValidVideoUrl(videoUrl)) {
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
            <button
              onClick={openModal}
              className="block w-full h-full focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
            >
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
            // Non-YouTube Video Stylings (including attachment videos)
            <div className="relative w-full h-full">
              {thumbnail ? (
                <img className="w-full h-full object-cover" src={thumbnail} alt="Video Thumbnail" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <button
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-primaryColor cursor-pointer hover:bg-opacity-90 transition-all"
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
                className="absolute -top-1 -right-1 rounded-full focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 hover:scale-105 transition-transform bg-transparent"
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
