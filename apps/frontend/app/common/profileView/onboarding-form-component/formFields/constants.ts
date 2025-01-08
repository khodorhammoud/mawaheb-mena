export const DEFAULT_FORM_FIELDS = {
    portfolio: {
        projectName: "",
        projectLink: "",
        projectDescription: "",
        projectImageName: "",
        projectImageUrl: "",
    },
    workHistory: {
        title: "",
        company: "",
        currentlyWorkingThere: false,
        startDate: new Date(),
        endDate: new Date(),
        jobDescription: "",
    },
    certificates: {
        certificateName: "",
        issuedBy: "",
        yearIssued: 0,
        attachmentName: "",
        attachmentUrl: "",
    },
    educations: {
        degree: "",
        institution: "",
        graduationYear: 0,
    },
};