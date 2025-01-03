import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/common/header/card";
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

  /* 
  INFO: repeatable fields
  repeatable field types:
    - portfolio
    - work history
    - certificate
    - education
  */

  // =========== repeatable fields default values =============
  const portfolioFormFields: PortfolioFormFieldType = {
    projectName: "",
    projectLink: "",
    projectDescription: "",
    projectImageName: "",
    projectImageUrl: "",
  };

  const workHistoryFormFields: WorkHistoryFormFieldType = {
    title: "",
    company: "",
    currentlyWorkingThere: false,
    startDate: new Date(),
    endDate: new Date(),
    jobDescription: "",
  };

  const certificatesFormFields: CertificateFormFieldType = {
    certificateName: "",
    issuedBy: "",
    yearIssued: 0,
    attachmentName: "",
    attachmentUrl: "",
  };

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
          <>
            <Input
              type="number"
              placeholder="Enter a number"
              value={inputValue as number}
              name={fieldName}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md mb-8"
            />

            <RangeComponent minVal={minVal} maxVal={maxVal} />
          </>
        );
      case "textArea":
        return (
          <>
            <textarea
              value={inputValue as string}
              name={fieldName}
              placeholder="Add content to describe yourself"
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500">
              {(inputValue as string).length} / 2000 characters
            </div>
          </>
        );
      case "increment":
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="w-10 h-10"
              type="button"
              onClick={() => handleIncrement(-1)}
            >
              -
            </Button>
            <Input
              type="number"
              value={inputValue as number}
              name={fieldName}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <Button
              variant="outline"
              className="w-10 h-10"
              type="button"
              onClick={() => {
                handleIncrement(1);
              }}
            >
              +
            </Button>
          </div>
        );
      case "video":
        return (
          <Input
            type="text"
            placeholder="Paste YouTube URL or upload video"
            value={inputValue as string}
            name={fieldName}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
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
          <div className="space-y-4">
            <AnimatePresence>
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
                  className="border rounded-md"
                >
                  <div className="p-2">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => toggleCollapse(index)}
                        className="text-blue-500"
                      >
                        {expandedIndex === index ? "Collapse" : "Expand"} Form{" "}
                        {index + 1}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => handleRemoveRepeatableField(index)}
                        className="border-red-500 text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden mt-4"
                        >
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
                          ) : repeatableFieldName === "workHistory" ? (
                            <WorkHistoryComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                            />
                          ) : repeatableFieldName === "certificates" ? (
                            <CertificateComponent
                              data={dataItem}
                              onTextChange={(updatedData) =>
                                handleDataChange(index, updatedData)
                              }
                              onFileChange={(file) =>
                                handleFileChange(index, file)
                              }
                            />
                          ) : repeatableFieldName === "educations" ? (
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
            <Button
              variant="outline"
              type="button"
              onClick={handleAddRepeatableField}
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
    <Card
      className="w-full p-4 bg-gray-100 border border-gray-400 border-dashed rounded-2xl"
      style={{
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        borderSpacing: "10px",
      }}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">{cardTitle}</CardTitle>
        {/* add subtitle */}
        {cardSubtitle && <CardDescription>{cardSubtitle}</CardDescription>}
      </CardHeader>

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="trigger flex items-center space-x-2 border border-gray-400"
            style={{
              borderWidth: "2px",
              borderColor: "#cbd5e1",
              borderRadius: "8px",
            }}
          >
            {triggerIcon}
            <span>{triggerLabel}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogTitle>{popupTitle}</DialogTitle>
          {/* Display Error Message */}
          {showStatusMessage && fetcher.data?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">
                {fetcher.data.error.message}
              </span>
            </div>
          )}
          {/* Display Success Message */}
          {showStatusMessage && fetcher.data?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">updated successfully</span>
            </div>
          )}
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
            <DialogFooter>
              <Button
                type="submit"
                className="action bg-blue-600 text-white px-4 py-2 rounded-lg"
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
