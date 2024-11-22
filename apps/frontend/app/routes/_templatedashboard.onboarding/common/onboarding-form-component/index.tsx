import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/common/header/card";
import Upload from "~/common/upload/Upload";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import RangeComponent from "./RangeComponent";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
  OnboardingEmployerFields,
  OnboardingFreelancerFields,
} from "~/types/User";
import PortfolioComponent from "./PortfolioComponent";
import WorkHistoryComponent from "./WorkHistory";
import CertificateComponent from "./CertificateComponent";
import { motion, AnimatePresence } from "framer-motion";
import EducationComponent from "./EducationComponent";
import AppFormField from "~/common/form-fields";
import { FaLink } from "react-icons/fa";
import Or from "~/common/or/Or";

interface GeneralizableFormCardProps {
  formType:
    | "text"
    | "number"
    | "range"
    | "textArea"
    | "increment"
    | "video"
    | "file"
    | "repeatable"
    | "custom";
  cardTitle: string;
  cardSubtitle?: string;
  popupTitle: string;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  formName: string;
  fieldName: string;
  minVal?: number;
  maxVal?: number;
  repeatableFieldName?: string;
}

function GeneralizableFormCard({
  formType,
  cardTitle,
  cardSubtitle,
  popupTitle,
  triggerLabel,
  formName,
  fieldName,
  triggerIcon,
  minVal,
  maxVal,
  repeatableFieldName,
}: GeneralizableFormCardProps) {
  const initialData = useLoaderData<
    OnboardingEmployerFields | OnboardingFreelancerFields
  >();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  /* 
  set the initial value of the input field based on the form type
  in case of repeatable, repeatableinputValue is used
   */
  const [inputValue, setInputValue] = useState<number | string | File>(
    formType !== "repeatable"
      ? (initialData?.[fieldName] ?? (formType === "increment" ? 0 : ""))
      : null
  );

  // =========== repeatable fields default values =============
  // PORTFOLIO
  const portfolioFormFields: PortfolioFormFieldType = {
    projectName: "",
    projectLink: "",
    projectDescription: "",
    projectImageName: "",
    projectImageUrl: "",
  };

  // WORK HISTORY
  const workHistoryFormFields: WorkHistoryFormFieldType = {
    title: "",
    company: "",
    currentlyWorkingThere: false,
    startDate: new Date(),
    endDate: new Date(),
    jobDescription: "",
  };

  // CERTIFICATE
  const certificatesFormFields: CertificateFormFieldType = {
    certificateName: "",
    issuedBy: "",
    yearIssued: 0,
    attachmentName: "",
    attachmentUrl: "",
  };

  // EDUCATION
  const educationFormFields: EducationFormFieldType = {
    degree: "",
    institution: "",
    graduationYear: 0,
  };

  // =========== end of repeatable fields default values =============

  // =========== repeatable fields state =============
  const [repeatableInputValues, setRepeatableInputValues] = useState<
    | PortfolioFormFieldType[]
    | WorkHistoryFormFieldType[]
    | CertificateFormFieldType[]
    | EducationFormFieldType[]
  >([]);

  // file uploads in repeatable fields
  const [repeatableInputFiles, setRepeatableInputFiles] = useState<File[]>([]);

  // =========== end of repeatable fields state =============

  // =========== repeatable fields handlers =============

  const handleAddRepeatableField = () => {
    switch (repeatableFieldName) {
      case "portfolio":
        setRepeatableInputValues((prevValues) => [
          ...(prevValues as PortfolioFormFieldType[]),
          { ...portfolioFormFields },
        ]);

        break;
      case "workHistory":
        setRepeatableInputValues((prevValues) => [
          ...(prevValues as WorkHistoryFormFieldType[]),
          { ...workHistoryFormFields },
        ]);
        break;
      case "certificates":
        setRepeatableInputValues((prevValues) => [
          ...(prevValues as CertificateFormFieldType[]),
          { ...certificatesFormFields },
        ]);
        break;
      case "educations":
        setRepeatableInputValues((prevValues) => [
          ...(prevValues as EducationFormFieldType[]),
          { ...educationFormFields },
        ]);
        break;
      default:
        break;
    }
    setRepeatableInputFiles([...repeatableInputFiles, null]);
    setExpandedIndex(repeatableInputValues.length); // Expand the newly added field
  };

  const handleRemoveRepeatableField = (index: number) => {
    setRepeatableInputValues(
      (prevValues) =>
        prevValues.filter((_, i) => i !== index) as typeof repeatableInputValues
    );
    setRepeatableInputFiles(repeatableInputFiles.filter((_, i) => i !== index));
    setExpandedIndex(null); // Collapse all fields after removal
  };

  const toggleCollapse = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDataChange = (
    index: number,
    updatedData:
      | PortfolioFormFieldType
      | WorkHistoryFormFieldType
      | CertificateFormFieldType
      | EducationFormFieldType
  ) => {
    setRepeatableInputValues((prevValues) => {
      const updatedInputValues = [...prevValues];
      updatedInputValues[index] = {
        ...updatedInputValues[index],
        ...updatedData,
      };
      return updatedInputValues as typeof prevValues;
    });
  };

  const handleFileChange = (index: number, file: File) => {
    const updatedInputFiles = [...repeatableInputFiles];
    updatedInputFiles[index] = file;
    setRepeatableInputFiles(updatedInputFiles);

    let updatedInputValues:
      | PortfolioFormFieldType[]
      | CertificateFormFieldType[]
      | EducationFormFieldType[];
    switch (repeatableFieldName) {
      case "portfolio":
        updatedInputValues = [
          ...repeatableInputValues,
        ] as PortfolioFormFieldType[];
        (updatedInputValues[index] as PortfolioFormFieldType).projectImageName =
          file.name;
        setRepeatableInputValues(updatedInputValues);
        break;
      case "certificates":
        updatedInputValues = [
          ...repeatableInputValues,
        ] as CertificateFormFieldType[];
        (updatedInputValues[index] as CertificateFormFieldType).attachmentName =
          file.name;
        setRepeatableInputValues(updatedInputValues);
        break;
      case "educations":
        updatedInputValues = [
          ...repeatableInputValues,
        ] as EducationFormFieldType[];
        setRepeatableInputValues(updatedInputValues);
        break;
      default:
        break;
    }
  };

  // =========== end of repeatable fields handlers =============

  // Initialize repeatable fields with existing data
  useEffect(() => {
    if (formType === "repeatable") {
      let dataParsed = false;
      if (initialData && initialData[fieldName]) {
        try {
          const repeatableData = JSON.parse(initialData[fieldName]) as
            | PortfolioFormFieldType[]
            | WorkHistoryFormFieldType[]
            | CertificateFormFieldType[]
            | EducationFormFieldType[];
          setRepeatableInputValues(repeatableData);
          setRepeatableInputFiles(repeatableData.map(() => null));
          dataParsed = true;
        } catch (error) {
          console.error("Error parsing repeatable data", error);
        }
      }
      if (!dataParsed) {
        switch (repeatableFieldName) {
          case "portfolio":
            setRepeatableInputValues([portfolioFormFields]);
            break;
          case "workHistory":
            setRepeatableInputValues([workHistoryFormFields]);
            break;
          case "certificates":
            setRepeatableInputValues([certificatesFormFields]);
            break;
          case "educations":
            setRepeatableInputValues([educationFormFields]);
            break;
        }
        setRepeatableInputFiles([null]);
      }
    }
  }, []);

  // -----------------------------
  // form fetcher fields
  const fetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  const [showStatusMessage, setShowStatusMessage] = useState(false); // Track bio message visibility

  // Handle showing the bio submission message
  useEffect(() => {
    if (fetcher.data?.success || fetcher.data?.error) {
      setShowStatusMessage(true);
    }
  }, [fetcher.data]);

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    formData.append(repeatableFieldName, JSON.stringify(repeatableInputValues));
    // add files
    repeatableInputFiles.forEach((file, index) => {
      formData.append(`${repeatableFieldName}-attachment[${index}]`, file);
    });

    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  const handleIncrement = (step: number) => {
    fetcher.submit(
      {
        "target-updated": formName,
        [fieldName]: ((inputValue as number) + step).toString(),
      },
      { method: "post" }
    );

    setInputValue((prev) => {
      if (typeof prev === "number") {
        return prev + step;
      } else {
        // Handle the case where `prev` is not a number, if necessary
        console.warn("Expected a number but got a different type");
        return prev;
      }
    });
  };

  const renderFormField = () => {
    switch (formType) {
      case "text":
        return (
          <Input
            type="text"
            placeholder="Enter text"
            value={inputValue as string}
            onChange={(e) => setInputValue(e.target.value)}
            name={fieldName}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder="Enter a number"
            value={inputValue as number}
            name={fieldName}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "range":
        return (
          <div className="flex flex-col">
            <div className="">
              <div className="w-[50%] mb-6 relative">
                <AppFormField
                  type="number"
                  id="number-input"
                  name={fieldName}
                  label="Hourly Rate"
                  placeholder="Hourly Rate"
                  onChange={(e) => setInputValue(Number(e.target.value))}
                  className="no-spinner"
                />
                <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
              </div>
            </div>

            <p className="mb-14 text-base">
              The median {popupTitle} for a designer is:
            </p>
            <RangeComponent minVal={minVal} maxVal={maxVal} />
          </div>
        );
      case "textArea":
        return (
          <div className="flex flex-col gap-2">
            <AppFormField
              type="textarea"
              id="description"
              name={fieldName}
              label="Add content to describe yourself"
              placeholder="Add content to describe yourself"
              col={6} // Represents rows as height (in rem units)
              defaultValue={inputValue as string}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <div className="ml-6 text-xs text-gray-500">
              {(inputValue as string).length} / 2000 characters
            </div>
          </div>
        );
      case "increment":
        return (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="flex items-center border border-gray-300 rounded-xl w-full">
              {/* - Button */}
              <button
                type="button"
                className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-l-xl border-r text-2xl"
                style={{ borderRight: "none" }} // Remove the right border of the - button
                onClick={() => handleIncrement(-1)}
              >
                <div className="hover:bg-gray-100 px-2 rounded-full">−</div>
              </button>

              {/* Input Display */}
              <div className="w-full h-12 flex justify-center items-center border-x border-gray-300 text-lg">
                {typeof inputValue === "number" ||
                typeof inputValue === "string"
                  ? inputValue
                  : ""}
              </div>

              {/* + Button */}
              <button
                type="button"
                className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-r-xl text-2xl"
                style={{ borderLeft: "none" }} // Remove the left border of the + button
                onClick={() => handleIncrement(1)}
              >
                <div className="hover:bg-gray-100 px-2 rounded-full">+</div>
              </button>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="">
            {/* UPLOAD */}
            <Upload />

            {/* OR */}
            <Or />

            {/* FORM */}
            <div className="">
              <div className="relative">
                <AppFormField
                  type="text"
                  id="youtube-url"
                  name={fieldName}
                  label="Paste YouTube URL or upload video"
                  placeholder="Paste YouTube URL or upload video"
                  defaultValue={inputValue as string}
                  onChange={(e) => setInputValue(e.target.value)}
                  className=""
                />
                <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
              </div>
            </div>
          </div>
        );
      case "file":
        return (
          <Input
            type="file"
            name={fieldName}
            onChange={(e) =>
              setInputValue(e.target.files ? e.target.files[0] : null)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "repeatable":
        return (
          <div className="space-y-4 overflow-hidden">
            <AnimatePresence>
              {/* DETERMINE THE TYPE OF REPEATABLE */}
              {repeatableInputValues.map((dataItem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 1, backgroundColor: "transparent" }}
                  animate={{ opacity: 1, backgroundColor: "transparent" }}
                  exit={{
                    opacity: 0,
                    backgroundColor: "#f8d7da", // Faint red color
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border rounded-xl"
                >
                  <div className="p-3">
                    {/* EXPAND/COLLAPSE BUTTON */}
                    <div className="flex justify-between items-center">
                      {/* EXPAND BUTTON */}
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => toggleCollapse(index)}
                        className={`border rounded-xl not-active-gradient py-1 ${
                          expandedIndex === index
                            ? "bg-primaryColor text-white" // Active state styles
                            : "text-primaryColor border-primaryColor hover:text-white" // Default state styles
                        }`}
                      >
                        {expandedIndex === index ? "Collapse" : "Expand"}{" "}
                        Project Form {index + 1}
                      </Button>

                      {/* COLLAPSE BUTTON */}
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleRemoveRepeatableField(index)}
                        className="border-red-500 text-red-500 rounded-xl not-active-gradient-red hover:text-white py-1"
                      >
                        Remove
                      </Button>
                    </div>

                    {/* THE CONTENT THAT APPEAR UNDER THE 2 BUTTONS */}
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden mt-4"
                        >
                          {/* PORTFILIO SECTION */}
                          {repeatableFieldName === "portfolio" ? (
                            <PortfolioComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                              onFileChange={(file) =>
                                handleFileChange(index, file)
                              }
                            />
                          ) : // WORK HISTORYSECTION
                          repeatableFieldName === "workHistory" ? (
                            <WorkHistoryComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                            />
                          ) : // CERTIFICATES
                          repeatableFieldName === "certificates" ? (
                            <CertificateComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                              onFileChange={(file) =>
                                handleFileChange(index, file)
                              }
                            />
                          ) : // EDUCATION
                          repeatableFieldName === "educations" ? (
                            <EducationComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                            />
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {/* ADDING BUTTON */}
            <Button
              variant="outline"
              type="button"
              onClick={handleAddRepeatableField}
              className="not-active-gradient-black rounded-xl ml-4 hover:text-white"
            >
              + Add Field
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // THE CARDS
    <Card className="bg-gray-100 border-2 border-gray-300 rounded-xl border-dashed pl-8 pb-5 pt-5 h-auto grid w-auto">
      {/* TITLE AND SUBTITLE */}
      <CardHeader className="p-0">
        {/* TITLE */}
        <CardTitle className="text-lg font-semibold mb-2 xl:w-[60%] w-[80%]">
          {cardTitle}
        </CardTitle>
        {/* SUBTITLE IF EXISTS */}
        {cardSubtitle && (
          <CardDescription className="xl:w-[300px] lg:w-[250px] md:w-[300px] w-[250px]">
            {cardSubtitle}
          </CardDescription>
        )}
      </CardHeader>

      {/* BUTTON AND POPUP */}
      <Dialog>
        {/* CARD BUTTON */}
        <DialogTrigger>
          <Button
            variant="outline"
            className="text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white space-x-2 mt-6"
          >
            {triggerIcon}
            <span>{triggerLabel}</span>
          </Button>
        </DialogTrigger>

        {/* CARD POPUP */}
        <DialogContent className="bg-white">
          {/* POPUP TITLE + ERROR/SUCCESS MESSAGES*/}
          <DialogTitle className="mt-3 tracking-normal">
            {popupTitle}
          </DialogTitle>

          {/* ERROR */}
          {showStatusMessage && fetcher.data?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-6">
              <span className="block sm:inline">
                {fetcher.data.error.message}
              </span>
            </div>
          )}

          {/* SUCCESS */}
          {showStatusMessage && fetcher.data?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-6">
              <span className="block sm:inline">updated successfully</span>
            </div>
          )}

          {/* POPUP FORM + SAVE BUTTON */}
          <fetcher.Form
            method="post"
            className="space-y-6"
            ref={formRef}
            {...(formType === "repeatable"
              ? { encType: "multipart/form-data", onSubmit: handleSubmit }
              : {})}
          >
            <input type="hidden" name="target-updated" value={formName} />
            {renderFormField()}

            {/* SAVE BUTTON */}
            <DialogFooter>
              <Button
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default GeneralizableFormCard;
