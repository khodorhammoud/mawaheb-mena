export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_verified: boolean;
    is_onboarded: boolean;
    role: string;
    account?: Account;
}

export interface Account {
    id: number;
    slug: string;
    account_type: 'freelancer' | 'employer' | 'admin';
    account_status: string;
    country?: string;
    address?: string;
    region?: string;
    phone?: string;
    website_url?: string;
    social_media_links?: Record<string, string>;
    is_creation_complete: boolean;
}

export interface Freelancer {
    id: number;
    account_id: number;
    about?: string;
    fields_of_expertise?: string[];
    portfolio?: PortfolioItem[];
    work_history?: WorkHistoryItem[];
    cv_link?: string;
    video_link?: string;
    video_type?: string;
    certificates?: CertificateItem[];
    educations?: EducationItem[];
    years_of_experience?: number;
    preferred_project_types?: string[];
    hourly_rate?: number;
    compensation_type?: string;
    available_for_work?: boolean;
    available_from?: string;
    jobs_open_to?: string[];
    hours_available_from?: string;
    hours_available_to?: string;
    skills?: Skill[];
    languages?: Language[];
    account?: Account;
}

export interface Employer {
    id: number;
    account_id: number;
    budget?: number;
    employerAccountType?: string;
    company_name?: string;
    employer_name?: string;
    company_email?: string;
    about?: string;
    industry_sector?: string;
    years_in_business?: number;
    industries?: Industry[];
    jobs?: Job[];
    account?: Account;
}

export interface Job {
    id: number;
    employer_id: number;
    title: string;
    description: string;
    job_category_id?: number;
    working_hours_per_week?: number;
    location_preference?: string;
    project_type?: string;
    budget?: number;
    expected_hourly_rate?: number;
    experience_level?: string;
    status: string;
    created_at: string;
    fulfilled_at?: string;
    employer?: Employer;
    skills?: Skill[];
    category?: JobCategory;
    applications?: JobApplication[];
    match_score?: number;
}

export interface JobCategory {
    id: number;
    label: string;
}

export interface Skill {
    id: number;
    label: string;
    is_hot?: boolean;
    pivot?: {
        years_of_experience?: number;
        is_starred?: boolean;
    };
}

export interface Language {
    id: number;
    language: string;
}

export interface Industry {
    id: number;
    label: string;
    metadata?: string[];
}

export interface JobApplication {
    id: number;
    job_id: number;
    freelancer_id: number;
    status: string;
    created_at: string;
    job?: Job;
    freelancer?: Freelancer;
}

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    payload?: Record<string, any>;
    is_read: boolean;
    created_at: string;
    read_at?: string;
}

export interface Review {
    id: number;
    employer_id: number;
    freelancer_id: number;
    rating: number;
    comment?: string;
    review_type: string;
    created_at: string;
}

export interface Skillfolio {
    id: number;
    user_id: number;
    domain?: string;
    field?: string;
    category?: string;
    subfield?: string;
    readiness_score?: number;
    strengths?: string[];
    weaknesses?: string[];
    gaps?: string[];
    profile?: Record<string, any>;
}

export interface TimesheetEntry {
    id: number;
    date: string;
    description: string;
    note: string;
    startAt: string;
    endAt: string;
    startHour: number;
    startMeridiem: 'AM' | 'PM';
    endHour: number;
    endMeridiem: 'AM' | 'PM';
    hours: number;
    entryStatus: string;
}

export interface TimesheetWeek {
    id: number;
    freelancer_id: number;
    job_application_id: number;
    week_start: string;
    week_end: string;
    total_hours: number;
    status: string;
    submission_date: string;
}

export interface PortfolioItem {
    projectName: string;
    projectDescription: string;
    projectLink?: string;
    projectImageUrl?: string;
    projectImageName?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentId?: number | null;
}

export interface WorkHistoryItem {
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    jobDescription: string;
}

export interface CertificateItem {
    certificateName: string;
    issuedBy: string;
    issueDate?: string;
    attachmentId?: number | null;
    attachmentName?: string;
}

export interface EducationItem {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
