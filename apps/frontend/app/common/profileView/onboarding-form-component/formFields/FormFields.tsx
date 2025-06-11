import { Input } from '~/components/ui/input';
import RangeComponent from './RangeComponent';
import AppFormField from '~/common/form-fields';
import { FaLink } from 'react-icons/fa';
import type { FormFieldProps } from '../types';
import VideoUpload from '~/common/upload/videoUpload';
import Or from '~/common/or/Or';
import RichTextEditor from '~/components/ui/richTextEditor';
import FileUpload from '~/common/upload/fileUpload';
import { getWordCount } from '~/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from '~/components/hooks/use-toast';
import { isValidYouTubeUrl } from '~/utils/video';
import { FileField } from './fileFields';

export const FormFields = {
  text: ({ value, onChange, name }: FormFieldProps) => (
    <Input
      type="text"
      placeholder="Enter text"
      value={value as string}
      onChange={onChange}
      name={name}
      className="w-full p-3 border border-gray-300 rounded-md"
    />
  ),

  number: ({ value, onChange, name }: FormFieldProps) => (
    <AppFormField
      type="number"
      id="number-input"
      name={name}
      label="Enter a number"
      placeholder="Enter a number"
      onChange={onChange}
      className="no-spinner"
      defaultValue={value ? value.toString() : ''}
    />
  ),

  range: ({ value, onChange, name, props }: FormFieldProps) => (
    <div className="flex flex-col ml-1">
      <div className="w-[50%] mb-6 relative">
        <AppFormField
          type="number"
          id="number-input"
          name={name}
          label={props.cardTitle}
          placeholder={props.popupTitle}
          onChange={onChange}
          className="no-spinner"
          defaultValue={value as string}
        />
        {/* <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" /> */}
      </div>
      <p className="mb-14 text-base">The median {props.popupTitle} for a designer is:</p>
      <RangeComponent minVal={props.minVal} maxVal={props.maxVal} />
    </div>
  ),

  textArea: ({ value, onChange, name, props }: FormFieldProps) => (
    <div className="flex flex-col gap-2">
      {props?.useRichText ? (
        <RichTextEditor
          name={name}
          value={(value as string) || ''}
          onChange={content => {
            const event = {
              target: {
                value: content,
                name,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          placeholder="Add content to describe yourself"
          className="border-gray-300 rounded-md resize-none mt-6 mb-1 text-left break-words whitespace-normal overflow-hidden"
          style={{
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        />
      ) : (
        <AppFormField
          type="textarea"
          id="description"
          name={name}
          label="Add content to describe yourself"
          placeholder="Add content to describe yourself"
          col={6}
          onChange={onChange}
        />
      )}

      <div className="ml-6 text-xs text-gray-500">
        {getWordCount(value as string)} / 2000 characters
      </div>
    </div>
  ),

  increment: ({ value, handleIncrement, props }: FormFieldProps) => (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center border border-gray-300 rounded-xl w-full">
        {/* - Button */}
        <button
          type="button"
          className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-l-xl border-r text-2xl"
          style={{ borderRight: 'none' }}
          onClick={() => handleIncrement(-1)}
        >
          <div className="hover:bg-gray-100 px-2 rounded-full">−</div>
        </button>

        {/* Input Display */}
        <div className="w-full h-12 flex justify-center items-center border-x border-gray-300 text-lg">
          {typeof value === 'number' || typeof value === 'string' ? value : ''}
        </div>

        {/* + Button */}
        <button
          type="button"
          className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-r-xl text-2xl"
          style={{ borderLeft: 'none' }}
          onClick={() => handleIncrement(1)}
        >
          <div className="hover:bg-gray-100 px-2 rounded-full">+</div>
        </button>
      </div>
    </div>
  ),

  video: ({ value, onChange, name, props }: FormFieldProps) => {
    // Local state for controlled input
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [youtubeUrl, setYoutubeUrl] = useState<string>('');

    // When value changes from parent, sync local state
    useEffect(() => {
      if (typeof value === 'string') {
        setYoutubeUrl(value);
        setVideoFile(null);
      } else if (value instanceof File) {
        setVideoFile(value);
        setYoutubeUrl('');
      } else {
        setYoutubeUrl('');
        setVideoFile(null);
      }
    }, [value]);

    // User typing: Only update local state, DO NOT call parent
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setYoutubeUrl(e.target.value);
    };

    // Validate on blur (or when you hit "Save")
    const handleInputBlur = () => {
      if (!youtubeUrl) return;

      if (!isValidYouTubeUrl(youtubeUrl)) {
        // Show error toast, don't update parent
        toast({
          variant: 'destructive',
          title: 'Invalid video URL',
          description: 'Please provide a valid YouTube link (not a random string, bro).',
        });
        setYoutubeUrl(''); // Optionally clear the input
        return;
      }
      // If valid: call parent, show success toast
      onChange?.({
        target: {
          value: youtubeUrl,
          name,
        },
      } as React.ChangeEvent<HTMLInputElement>);
      toast({
        variant: 'default',
        title: 'YouTube link accepted',
        description: 'Your video link is valid and ready to be saved!',
      });
    };

    // File upload: update parent immediately
    const handleVideoUpload = (file: File) => {
      setVideoFile(file);
      setYoutubeUrl('');
      toast({
        variant: 'default',
        title: 'Video uploaded',
        description: 'Your video file was uploaded successfully!',
      });
    };

    return (
      <div className="space-y-4 ml-1 mr-1">
        {/* File upload */}
        {!youtubeUrl && !videoFile && (
          <VideoUpload
            onFileChange={handleVideoUpload}
            file={videoFile}
            onClear={() => {
              setVideoFile(null);
              onChange?.({ target: { value: '', name } } as any);
            }}
          />
        )}
        {!youtubeUrl && !videoFile && <Or />}

        {/* YouTube URL input */}
        {!videoFile && (
          <div className="relative">
            <AppFormField
              type="text"
              id="youtube-url"
              name={name}
              label="Paste YouTube URL or upload video"
              placeholder="Paste YouTube URL or upload video"
              value={youtubeUrl}
              onChange={handleInputChange} // Only local update!
              onBlur={handleInputBlur} // Only update parent on blur!
              className=""
            />
            <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
          </div>
        )}

        {/* Show URL if filled */}
        {youtubeUrl && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <span className="truncate">{youtubeUrl}</span>
            <button
              onClick={() => {
                setYoutubeUrl('');
                setVideoFile(null);
                onChange?.({ target: { value: '', name } } as any);
              }}
              className="ml-2 text-red-500"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        {/* Show file if uploaded */}
        {videoFile && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <span className="truncate">{videoFile.name}</span>
            <button
              onClick={() => {
                setVideoFile(null);
                setYoutubeUrl('');
                onChange?.({ target: { value: '', name } } as any);
              }}
              className="ml-2 text-red-500"
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        {/* If a YouTube URL is used, send it */}
        {youtubeUrl && <input type="hidden" name={name} value={youtubeUrl} />}

        {/* If a video file is used, send it via a real file input */}
        {videoFile && (
          <input
            type="file"
            name={name}
            style={{ display: 'none' }}
            // Just render it and let the browser handle the file binding
          />
        )}
      </div>
    );
  },

  file: ({ value, onChange, name, props, handleIncrement }: FormFieldProps) => (
    <FileField
      value={value}
      onChange={onChange}
      name={name}
      props={props}
      handleIncrement={handleIncrement}
    />
  ),
};
