// import { integer } from 'drizzle-orm/pg-core';
import { db } from '../drizzle/connector';
import { sql } from 'drizzle-orm';
import {
  UsersTable,
  accountsTable,
  freelancersTable,
  employersTable,
  languagesTable,
  freelancerLanguagesTable,
  industriesTable,
  skillsTable,
  jobsTable,
  jobSkillsTable,
  freelancerSkillsTable,
  jobCategoriesTable,
  jobApplicationsTable,
  userVerificationsTable,
} from '../drizzle/schemas/schema';
// Import the inferred types from the schema
import type { InferInsertModel } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import {
  AccountStatus,
  AccountType,
  Provider,
  CompensationType,
  ProjectType,
  JobStatus,
  ExperienceLevel,
  LocationPreferenceType,
  JobsOpenTo,
  JobApplicationStatus,
} from '~/types/enums';
import { hash } from 'bcrypt-ts';
import { Label } from '@radix-ui/react-select';

// Define types for inserting data
type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  passHash: string;
  isVerified?: boolean;
  isOnboarded?: boolean;
  provider?: any;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Override the insert method for UsersTable to accept our NewUser type
const insertUser = (tx: any, data: NewUser) => {
  return tx.insert(UsersTable).values(data as any);
};

dotenv.config({
  path: '.env',
});

// Define IT-focused freelancer profiles
const FREELANCER_PROFILES = [
  {
    name: 'Alex Chen',
    title: 'Full Stack Developer',
    about:
      "I'm a full stack developer with 8 years of experience building web applications using React, Node.js, and PostgreSQL. I specialize in creating scalable, responsive applications with clean, maintainable code. I have extensive experience with modern JavaScript frameworks and have led teams in delivering complex projects on time and within budget.",
    // Replaced "Web Development" with "TypeScript" as it better aligns with modern web tech.
    expertise: ['TypeScript', 'JavaScript', 'React', 'Node.js'],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: "Bachelor's",
        fieldOfStudy: 'Computer Science',
        description:
          'Focused on software engineering and web technologies. Graduated with honors and completed a capstone project building a real-time collaboration platform.',
      },
      {
        institution: 'Stanford University',
        degree: "Master's",
        fieldOfStudy: 'Software Engineering',
        description:
          'Specialized in distributed systems and cloud architecture. Thesis on scalable microservices architecture patterns.',
      },
    ],
    workHistory: [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechNova Solutions',
        currentlyWorkingThere: true,
        jobDescription:
          'Leading a team of 5 developers building a SaaS platform for healthcare providers. Architected the system using React, Node.js, and PostgreSQL. Implemented CI/CD pipelines and containerized the application using Docker and Kubernetes.',
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Frontier',
        jobDescription:
          'Developed and maintained multiple client projects using React, Express, and MongoDB. Implemented authentication systems, payment processing, and real-time features using WebSockets.',
      },
      {
        title: 'Frontend Developer',
        company: 'WebSphere Inc',
        jobDescription:
          'Built responsive user interfaces using React and Redux. Collaborated with designers to implement pixel-perfect UIs and improve user experience.',
      },
    ],
    certificates: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        credentialId: 'AWS-CSA-12345',
        credentialURL:
          'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      },
      {
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB Inc',
        credentialId: 'MDB-DEV-67890',
        credentialURL: 'https://university.mongodb.com/certification',
      },
    ],
    skills: [
      { name: 'JavaScript', years: 8 },
      { name: 'React', years: 6 },
      { name: 'Node.js', years: 5 },
      { name: 'Python', years: 4 },
      { name: 'UI/UX Design', years: 3 },
    ],
    languages: ['English', 'Spanish', 'French'],
    hourlyRate: 85,
    yearsOfExperience: 8,
  },
  {
    name: 'Sophia Rodriguez',
    title: 'Data Scientist',
    about:
      "Data scientist with 6 years of experience applying statistical analysis, machine learning, and data visualization to solve complex business problems. Proficient in Python, R, SQL, and various ML frameworks. I've worked across industries including finance, healthcare, and e-commerce to deliver data-driven insights that drive business decisions.",
    expertise: ['Data Science', 'Python', 'Machine Learning', 'Data Analysis'],
    education: [
      {
        institution: 'Massachusetts Institute of Technology',
        degree: "Master's",
        fieldOfStudy: 'Data Science',
        description:
          'Specialized in machine learning algorithms and statistical modeling. Completed research on predictive analytics for healthcare outcomes.',
      },
      {
        institution: 'University of Michigan',
        degree: "Bachelor's",
        fieldOfStudy: 'Statistics',
        description:
          'Minored in Computer Science. Completed coursework in data structures, algorithms, and database systems.',
      },
    ],
    workHistory: [
      {
        title: 'Senior Data Scientist',
        company: 'Predictive Analytics Partners',
        currentlyWorkingThere: true,
        jobDescription:
          'Leading data science initiatives for financial services clients. Developing predictive models for credit risk assessment, fraud detection, and customer segmentation. Implementing ML pipelines using Python, TensorFlow, and AWS SageMaker.',
      },
      {
        title: 'Data Scientist',
        company: 'HealthTech Innovations',
        jobDescription:
          'Developed machine learning models to predict patient readmission risks and optimize treatment plans. Worked with large healthcare datasets and implemented privacy-preserving analytics techniques.',
      },
      {
        title: 'Data Analyst',
        company: 'E-Commerce Analytics',
        jobDescription:
          'Performed customer segmentation, churn prediction, and recommendation system development. Created interactive dashboards using Tableau and PowerBI for executive reporting.',
      },
    ],
    certificates: [
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        credentialId: 'TF-DEV-54321',
        credentialURL: 'https://www.tensorflow.org/certificate',
      },
      {
        name: 'Microsoft Certified: Azure Data Scientist Associate',
        issuer: 'Microsoft',
        credentialId: 'AZURE-DS-98765',
        credentialURL: 'https://learn.microsoft.com/en-us/certifications/azure-data-scientist/',
      },
    ],
    skills: [
      { name: 'Python', years: 6 },
      { name: 'Data Analysis', years: 6 },
      { name: 'Machine Learning', years: 5 },
      { name: 'SQL', years: 4 },
      { name: 'Data Engineering', years: 3 },
    ],
    languages: ['English', 'Spanish', 'Portuguese'],
    hourlyRate: 90,
    yearsOfExperience: 6,
  },
  {
    name: 'Michael Johnson',
    title: 'DevOps Engineer',
    about:
      'DevOps engineer with 7 years of experience automating infrastructure, implementing CI/CD pipelines, and managing cloud resources. Expert in AWS, Docker, Kubernetes, and Terraform. I focus on building reliable, scalable, and secure infrastructure that enables development teams to deliver features rapidly while maintaining system stability.',
    // Replace "Cloud Infrastructure" -> "Cloud Architecture", "Automation" -> "CI/CD", "Security" -> "Cybersecurity"
    expertise: ['DevOps', 'Cloud Architecture', 'CI/CD', 'Cybersecurity'],
    education: [
      {
        institution: 'Georgia Institute of Technology',
        degree: "Bachelor's",
        fieldOfStudy: 'Computer Engineering',
        description:
          'Focused on systems architecture and network security. Completed projects on automated deployment systems and containerization.',
      },
    ],
    workHistory: [
      {
        title: 'Lead DevOps Engineer',
        company: 'Cloud Solutions Inc',
        currentlyWorkingThere: true,
        jobDescription:
          'Managing cloud infrastructure across AWS and GCP for enterprise clients. Implementing Infrastructure as Code using Terraform and CloudFormation. Designing and maintaining Kubernetes clusters for microservices architectures.',
      },
      {
        title: 'DevOps Engineer',
        company: 'FinTech Innovations',
        jobDescription:
          'Built and maintained CI/CD pipelines using Jenkins, GitHub Actions, and ArgoCD. Implemented monitoring and alerting systems using Prometheus and Grafana. Reduced deployment time by 70% through automation.',
      },
      {
        title: 'Systems Administrator',
        company: 'Tech Solutions Group',
        jobDescription:
          'Managed on-premises and cloud infrastructure. Implemented backup and disaster recovery solutions. Migrated legacy systems to cloud platforms.',
      },
    ],
    certificates: [
      {
        name: 'AWS Certified DevOps Engineer - Professional',
        issuer: 'Amazon Web Services',
        credentialId: 'AWS-DEVOPS-24680',
        credentialURL:
          'https://aws.amazon.com/certification/certified-devops-engineer-professional/',
      },
      {
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        credentialId: 'CKA-13579',
        credentialURL: 'https://www.cncf.io/certification/cka/',
      },
    ],
    skills: [
      { name: 'AWS', years: 7 },
      { name: 'Docker', years: 6 },
      { name: 'Kubernetes', years: 5 },
      { name: 'Terraform', years: 4 },
      { name: 'Python', years: 3 },
    ],
    languages: ['English', 'German'],
    hourlyRate: 95,
    yearsOfExperience: 7,
  },
  {
    name: 'Emily Zhang',
    title: 'UI/UX Designer',
    about:
      'UI/UX designer with 5 years of experience creating intuitive, accessible, and visually appealing digital experiences. I combine user research, interaction design, and visual design to create products that delight users while meeting business objectives. I have expertise in design systems, responsive design, and user testing methodologies.',
    // Replace "Interaction Design" -> "UI/UX Design", "Visual Design" -> "Figma"
    expertise: ['User Research', 'UI/UX Design', 'Figma'],
    education: [
      {
        institution: 'Rhode Island School of Design',
        degree: "Bachelor's",
        fieldOfStudy: 'Graphic Design',
        description:
          'Focused on digital interfaces and user experience design. Completed coursework in typography, color theory, and interaction design.',
      },
      {
        institution: 'Interaction Design Foundation',
        degree: 'Certificate',
        fieldOfStudy: 'UX Design',
        description:
          'Specialized training in user research methods, usability testing, and information architecture.',
      },
    ],
    workHistory: [
      {
        title: 'Senior UI/UX Designer',
        company: 'Digital Experience Lab',
        currentlyWorkingThere: true,
        jobDescription:
          'Leading design for enterprise SaaS products. Creating and maintaining design systems. Conducting user research and usability testing to inform design decisions. Collaborating with development teams to ensure high-quality implementation.',
      },
      {
        title: 'Product Designer',
        company: 'Mobile Innovations',
        jobDescription:
          'Designed user interfaces for mobile applications across iOS and Android platforms. Created wireframes, prototypes, and high-fidelity mockups. Implemented design thinking methodologies to solve complex user problems.',
      },
      {
        title: 'UI Designer',
        company: 'Web Solutions Agency',
        jobDescription:
          'Designed responsive websites for clients across various industries. Created visual assets, icons, and illustrations. Collaborated with developers to ensure pixel-perfect implementation.',
      },
    ],
    certificates: [
      {
        name: 'Certified User Experience Professional',
        issuer: 'Nielsen Norman Group',
        credentialId: 'NNG-UX-12345',
        credentialURL: 'https://www.nngroup.com/ux-certification/',
      },
      {
        name: 'Adobe Certified Expert - XD',
        issuer: 'Adobe',
        credentialId: 'ADOBE-XD-67890',
        credentialURL: 'https://www.adobe.com/products/xd/certification.html',
      },
    ],
    skills: [
      { name: 'UI/UX Design', years: 5 },
      { name: 'Figma', years: 4 },
      { name: 'Adobe XD', years: 3 },
      { name: 'User Research', years: 4 },
      { name: 'Design Systems', years: 3 },
    ],
    languages: ['English', 'Mandarin', 'French'],
    hourlyRate: 80,
    yearsOfExperience: 5,
  },
];

// Define IT-focused employer profiles
const EMPLOYER_PROFILES = [
  {
    name: 'TechSolutions Global',
    description:
      "TechSolutions Global is a leading software development company specializing in enterprise solutions, cloud migration, and digital transformation. Founded in 2010, we've helped over 200 companies modernize their technology stack and improve operational efficiency.",
    industries: ['Software Development', 'Cloud Services', 'Enterprise Solutions'],
    companySize: '50-200 employees',
    location: 'United States',
    jobs: [
      {
        title: 'Senior React Developer',
        description:
          "We're looking for a Senior React Developer to join our front-end team working on enterprise SaaS applications. You'll be responsible for architecting and implementing complex UI components, optimizing application performance, and mentoring junior developers.\n\nResponsibilities:\n- Design and implement scalable React components and applications\n- Work with REST APIs and GraphQL to integrate front-end with back-end services\n- Implement state management solutions using Redux or Context API\n- Optimize application performance and ensure cross-browser compatibility\n- Collaborate with UX designers to implement responsive, accessible interfaces\n\nRequirements:\n- 5+ years of experience with React and modern JavaScript\n- Strong understanding of state management, hooks, and React best practices\n- Experience with TypeScript and testing frameworks (Jest, React Testing Library)\n- Knowledge of modern build tools and CI/CD pipelines\n- Excellent problem-solving and communication skills",
        skills: ['JavaScript', 'React', 'TypeScript', 'Redux', 'UI/UX Design'],
        experienceLevel: ExperienceLevel.Expert,
        projectType: ProjectType.LongTerm,
        budget: 8000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'DevOps Engineer',
        description:
          "We're seeking a DevOps Engineer to help us build and maintain our cloud infrastructure and CI/CD pipelines. You'll work closely with development teams to automate deployment processes and ensure system reliability and security.\n\nResponsibilities:\n- Design and implement cloud infrastructure using AWS services\n- Create and maintain CI/CD pipelines for automated testing and deployment\n- Implement monitoring, logging, and alerting solutions\n- Optimize system performance and cost-efficiency\n- Collaborate with development teams to resolve infrastructure issues\n\nRequirements:\n- 3+ years of experience with AWS and infrastructure as code (Terraform, CloudFormation)\n- Experience with containerization (Docker) and orchestration (Kubernetes)\n- Knowledge of CI/CD tools (Jenkins, GitHub Actions, CircleCI)\n- Familiarity with monitoring tools (Prometheus, Grafana, ELK stack)\n- Strong scripting skills (Bash, Python)",
        skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'Python'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 7000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Backend Node.js Developer',
        description:
          "We're looking for a Backend Developer with Node.js expertise to join our team building microservices for our enterprise platform. You'll design and implement scalable APIs, integrate with databases, and ensure high performance and reliability.\n\nResponsibilities:\n- Design and develop RESTful APIs and microservices using Node.js\n- Implement database schemas and queries (PostgreSQL, MongoDB)\n- Ensure code quality through testing and code reviews\n- Optimize application performance and scalability\n- Collaborate with front-end developers for seamless integration\n\nRequirements:\n- 3+ years of experience with Node.js and Express\n- Strong knowledge of SQL and NoSQL databases\n- Experience with microservices architecture\n- Understanding of authentication and security best practices\n- Familiarity with message queues and event-driven architecture",
        skills: ['Node.js', 'JavaScript', 'PostgreSQL', 'MongoDB', 'API Design'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 6500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Data Engineer',
        description:
          "We're seeking a Data Engineer to help us build and maintain our data infrastructure. You'll design data pipelines, implement ETL processes, and ensure data quality and accessibility for our analytics team.\n\nResponsibilities:\n- Design and implement data pipelines using modern tools and frameworks\n- Create and optimize ETL processes for various data sources\n- Implement data quality checks and monitoring\n- Collaborate with data scientists and analysts to support their data needs\n- Maintain and optimize data warehouse architecture\n\nRequirements:\n- 3+ years of experience in data engineering\n- Proficiency with Python and SQL\n- Experience with data processing frameworks (Apache Spark, Airflow)\n- Knowledge of cloud data services (AWS Redshift, S3, Glue)\n- Understanding of data modeling and warehouse design",
        skills: ['Data Engineering', 'Python', 'SQL', 'ETL', 'Data Analysis'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 7000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'UI/UX Designer',
        description:
          "We're looking for a UI/UX Designer to create intuitive and engaging user experiences for our enterprise applications. You'll work closely with product managers and developers to design interfaces that balance user needs with business goals.\n\nResponsibilities:\n- Create wireframes, prototypes, and high-fidelity mockups\n- Conduct user research and usability testing\n- Develop and maintain design systems and component libraries\n- Create user flows and journey maps\n- Collaborate with developers to ensure accurate implementation\n\nRequirements:\n- 3+ years of experience in UI/UX design for web applications\n- Proficiency with design tools (Figma, Adobe XD)\n- Understanding of accessibility standards and responsive design\n- Experience with user research methodologies\n- Portfolio demonstrating strong visual design skills",
        // Replace "Visual Design" -> "Adobe XD" and "Interaction Design" -> "Design Systems"
        skills: ['UI/UX Design', 'Figma', 'User Research', 'Adobe XD', 'Design Systems'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 6000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'QA Automation Engineer',
        description:
          "We're seeking a QA Automation Engineer to help us ensure the quality and reliability of our software products. You'll design and implement automated test frameworks, create test cases, and work with development teams to resolve issues.\n\nResponsibilities:\n- Design and implement automated test frameworks and scripts\n- Create comprehensive test plans and test cases\n- Execute manual and automated tests across different environments\n- Report and track bugs through issue tracking systems\n- Collaborate with developers to resolve quality issues\n\nRequirements:\n- 2+ years of experience in QA automation\n- Proficiency with test automation tools and frameworks (Selenium, Cypress, Jest)\n- Knowledge of programming languages (JavaScript, Python)\n- Experience with CI/CD pipelines and test integration\n- Strong analytical and problem-solving skills",
        // Remove "Testing" as no suitable replacement exists
        skills: ['QA Automation', 'JavaScript', 'Selenium', 'Cypress'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 5500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Mobile App Developer (React Native)',
        description:
          "We're looking for a Mobile App Developer with React Native expertise to help us build cross-platform mobile applications. You'll work on developing new features, improving performance, and ensuring a seamless user experience across iOS and Android platforms.\n\nResponsibilities:\n- Develop and maintain mobile applications using React Native\n- Implement responsive UI components and integrate with APIs\n- Optimize application performance and ensure cross-platform compatibility\n- Collaborate with designers and backend developers\n- Troubleshoot and fix bugs and performance bottlenecks\n\nRequirements:\n- 3+ years of experience with React Native development\n- Strong knowledge of JavaScript/TypeScript\n- Experience with native modules and third-party libraries\n- Understanding of mobile app architecture and state management\n- Familiarity with app deployment processes for iOS and Android",
        // Replace "iOS" and "Android" with "Mobile" and remove duplicates
        skills: ['React Native', 'JavaScript', 'Mobile'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 6500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Product Manager',
        description:
          "We're seeking a Product Manager to lead the development of our enterprise SaaS products. You'll work closely with stakeholders, designers, and developers to define product vision, prioritize features, and ensure successful delivery.\n\nResponsibilities:\n- Define product vision, strategy, and roadmap\n- Gather and prioritize requirements from stakeholders and customers\n- Create detailed product specifications and user stories\n- Collaborate with design and development teams throughout the product lifecycle\n- Analyze market trends and competitor offerings\n\nRequirements:\n- 4+ years of experience in product management for software products\n- Strong understanding of software development lifecycle\n- Experience with agile methodologies and project management tools\n- Excellent communication and presentation skills\n- Analytical mindset with ability to make data-driven decisions",
        // Replace non-matching skills with IT-focused ones
        skills: ['UI/UX Design', 'Data Analysis', 'Roadmapping'],
        experienceLevel: ExperienceLevel.Expert,
        projectType: ProjectType.LongTerm,
        budget: 8000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Technical Content Writer',
        description:
          "We're looking for a Technical Content Writer to create high-quality documentation, tutorials, and blog posts for our developer community. You'll work closely with our engineering team to explain complex technical concepts in clear, accessible language.\n\nResponsibilities:\n- Create technical documentation for APIs, SDKs, and developer tools\n- Write tutorials and how-to guides for developers\n- Produce blog posts on technical topics and product updates\n- Review and edit content for technical accuracy and clarity\n- Collaborate with engineers and product managers to gather information\n\nRequirements:\n- 2+ years of experience in technical writing for software products\n- Strong understanding of software development concepts\n- Excellent writing and editing skills\n- Ability to explain complex technical concepts clearly\n- Familiarity with documentation tools and markdown",
        // Replace with IT skills that might relate to technical documentation
        skills: ['API Design', 'UI/UX Design', 'Data Analysis'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.ShortTerm,
        budget: 3000,
        workingHours: 20,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Frontend Developer (Vue.js)',
        description:
          "We're seeking a Frontend Developer with Vue.js expertise for a short-term project to revamp our customer portal. You'll work on implementing new UI components, improving performance, and enhancing the overall user experience.\n\nResponsibilities:\n- Develop responsive UI components using Vue.js\n- Implement state management using Vuex or Pinia\n- Optimize application performance and loading times\n- Ensure cross-browser compatibility and accessibility\n- Collaborate with designers and backend developers\n\nRequirements:\n- 2+ years of experience with Vue.js development\n- Strong knowledge of JavaScript/TypeScript\n- Experience with Vue CLI, Vuex, and Vue Router\n- Understanding of responsive design and CSS preprocessors\n- Familiarity with testing frameworks (Jest, Vue Test Utils)",
        // Replace "Vuex", "CSS", and "Frontend Development" with a suitable IT skill
        skills: ['Vue.js', 'JavaScript', 'UI/UX Design'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.ShortTerm,
        budget: 4000,
        workingHours: 30,
        location: LocationPreferenceType.Remote,
      },
    ],
  },
  {
    name: 'DataInsight Innovations',
    description:
      'DataInsight Innovations is a data analytics and AI consulting firm that helps businesses leverage their data for strategic decision-making. We specialize in building custom analytics solutions, implementing machine learning models, and providing data strategy consulting.',
    industries: ['Data Analytics', 'Artificial Intelligence', 'Business Intelligence'],
    companySize: '20-50 employees',
    location: 'United Kingdom',
    jobs: [
      {
        title: 'Machine Learning Engineer',
        description:
          "We're looking for a Machine Learning Engineer to join our AI team. You'll design and implement machine learning models for various client projects, from natural language processing to computer vision applications.\n\nResponsibilities:\n- Design and develop machine learning models for client projects\n- Preprocess and analyze large datasets\n- Implement and optimize ML pipelines\n- Evaluate model performance and make improvements\n- Collaborate with data scientists and engineers\n\nRequirements:\n- 3+ years of experience in machine learning engineering\n- Strong knowledge of Python and ML frameworks (TensorFlow, PyTorch)\n- Experience with NLP, computer vision, or time series analysis\n- Understanding of feature engineering and model evaluation\n- Familiarity with ML deployment and MLOps practices",
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch', 'Data Science'],
        experienceLevel: ExperienceLevel.Expert,
        projectType: ProjectType.LongTerm,
        budget: 9000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Data Scientist',
        description:
          "We're seeking a Data Scientist to help our clients extract insights from their data. You'll work on various projects involving statistical analysis, predictive modeling, and data visualization.\n\nResponsibilities:\n- Analyze complex datasets to identify patterns and trends\n- Develop statistical models and machine learning algorithms\n- Create visualizations and dashboards to communicate findings\n- Collaborate with clients to understand their business problems\n- Present results and recommendations to stakeholders\n\nRequirements:\n- 3+ years of experience in data science\n- Strong knowledge of Python, R, and SQL\n- Experience with statistical analysis and machine learning\n- Proficiency with data visualization tools (Tableau, PowerBI)\n- Excellent communication and presentation skills",
        // Replace "R" and "Statistics" with "Data Analysis"
        skills: ['Data Science', 'Python', 'SQL', 'Data Analysis'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 7500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Data Engineer',
        description:
          "We're looking for a Data Engineer to build and maintain our data infrastructure. You'll design data pipelines, implement ETL processes, and ensure data quality and accessibility.\n\nResponsibilities:\n- Design and implement scalable data pipelines\n- Create ETL processes for various data sources\n- Optimize database schemas and queries\n- Implement data quality checks and monitoring\n- Collaborate with data scientists to support their data needs\n\nRequirements:\n- 3+ years of experience in data engineering\n- Proficiency with Python, SQL, and big data technologies\n- Experience with data processing frameworks (Spark, Airflow)\n- Knowledge of cloud data services (AWS, Azure, GCP)\n- Understanding of data modeling and warehouse design",
        // Remove "Apache Spark" as it's not in our IT skills list
        skills: ['Data Engineering', 'Python', 'SQL', 'ETL'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 7000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Business Intelligence Analyst',
        description:
          "We're seeking a Business Intelligence Analyst to help our clients transform their data into actionable insights. You'll design and implement BI solutions, create dashboards, and provide data-driven recommendations.\n\nResponsibilities:\n- Design and develop BI dashboards and reports\n- Analyze business data to identify trends and opportunities\n- Create data models and implement ETL processes\n- Collaborate with stakeholders to understand reporting needs\n- Present findings and recommendations to clients\n\nRequirements:\n- 2+ years of experience in business intelligence\n- Proficiency with BI tools (Tableau, Power BI, Looker)\n- Strong SQL skills and data modeling knowledge\n- Experience with ETL processes and data warehousing\n- Excellent analytical and problem-solving skills",
        // Replace non-matching skills with IT-focused ones
        skills: ['Data Analysis', 'SQL', 'Data Science'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 6000,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'NLP Specialist',
        description:
          "We're looking for an NLP Specialist to work on natural language processing projects for our clients. You'll design and implement solutions for text classification, sentiment analysis, entity recognition, and other NLP tasks.\n\nResponsibilities:\n- Develop NLP models for various applications\n- Preprocess and analyze text data\n- Implement and optimize NLP pipelines\n- Evaluate model performance and make improvements\n- Collaborate with data scientists and engineers\n\nRequirements:\n- 3+ years of experience in NLP\n- Strong knowledge of Python and NLP libraries (NLTK, spaCy, Transformers)\n- Experience with deep learning for NLP (BERT, GPT, etc.)\n- Understanding of text preprocessing and feature engineering\n- Familiarity with multiple languages is a plus",
        // Replace "NLP", "BERT", "Transformers" with IT skills
        skills: ['Machine Learning', 'Python', 'Data Science'],
        experienceLevel: ExperienceLevel.Expert,
        projectType: ProjectType.LongTerm,
        budget: 8500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Computer Vision Engineer',
        description:
          "We're seeking a Computer Vision Engineer to work on image and video analysis projects. You'll design and implement solutions for object detection, image classification, and other computer vision tasks.\n\nResponsibilities:\n- Develop computer vision models for various applications\n- Preprocess and analyze image and video data\n- Implement and optimize computer vision pipelines\n- Evaluate model performance and make improvements\n- Collaborate with data scientists and engineers\n\nRequirements:\n- 3+ years of experience in computer vision\n- Strong knowledge of Python and CV libraries (OpenCV, TensorFlow, PyTorch)\n- Experience with deep learning for computer vision (CNNs, object detection)\n- Understanding of image preprocessing and feature engineering\n- Familiarity with deployment of CV models in production",
        // Replace non-matching skills with IT-focused ones
        skills: ['Machine Learning', 'Python', 'TensorFlow'],
        experienceLevel: ExperienceLevel.Expert,
        projectType: ProjectType.LongTerm,
        budget: 8500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
      {
        title: 'Data Visualization Specialist',
        description:
          "We're looking for a Data Visualization Specialist to create compelling visual representations of complex data. You'll design interactive dashboards, infographics, and data stories that communicate insights effectively.\n\nResponsibilities:\n- Create interactive data visualizations and dashboards\n- Design clear and intuitive ways to present complex data\n- Develop custom visualization components using D3.js\n- Work with stakeholders to understand visualization needs\n- Ensure visualizations are accessible and responsive\n\nRequirements:\n- 3+ years of experience in data visualization\n- Expertise in D3.js and other visualization libraries\n- Strong JavaScript and HTML/CSS skills\n- Understanding of data visualization principles\n- Experience with dashboard design and UX principles",
        // Replace non-matching skills with IT-focused ones
        skills: ['UI/UX Design', 'JavaScript', 'Data Analysis'],
        experienceLevel: ExperienceLevel.Mid,
        projectType: ProjectType.LongTerm,
        budget: 6500,
        workingHours: 40,
        location: LocationPreferenceType.Remote,
      },
    ],
  },
];

// IT-focused skills
const IT_SKILLS = [
  {
    label: 'JavaScript',
    isHot: true,
    metaData: [
      'JavaScript',
      'JS',
      'JavaScript Developer',
      'JavaScript Engineer',
      'ES6',
      'ESNext',
      'Vanilla JS',
      'Web Development',
      'Frontend Development',
      'Full Stack Developer',
    ],
  },
  {
    label: 'Python',
    isHot: true,
    metaData: [
      'Python',
      'Python Developer',
      'Python Engineer',
      'Python Programmer',
      'matplotlib',
      'numpy',
      'pandas',
      'scipy',
      'scikit-learn',
      'tensorflow',
      'pytorch',
    ],
  },
  {
    label: 'React',
    isHot: true,
    metaData: [
      'React',
      'React.js',
      'React Developer',
      'React Engineer',
      'Frontend Development',
      'React Hooks',
      'Next.js',
      'Redux',
      'React Router',
      'Web Development',
    ],
  },
  {
    label: 'Node.js',
    isHot: true,
    metaData: [
      'Node.js',
      'NodeJS',
      'Node Developer',
      'Backend Development',
      'Express.js',
      'NestJS',
      'Fastify',
      'Server-side JavaScript',
      'Full Stack Developer',
    ],
  },
  {
    label: 'TypeScript',
    isHot: true,
    metaData: [
      'TypeScript',
      'TS',
      'TypeScript Developer',
      'Frontend Development',
      'Backend Development',
      'Strongly Typed JavaScript',
      'TypeScript Engineer',
      'Web Development',
    ],
  },
  {
    label: 'SQL',
    isHot: false,
    metaData: [
      'SQL',
      'Structured Query Language',
      'SQL Developer',
      'Database Management',
      'SQL Queries',
      'MySQL',
      'PostgreSQL',
      'SQL Server',
      'Oracle SQL',
      'Database Administrator',
    ],
  },
  {
    label: 'AWS',
    isHot: true,
    metaData: [
      'AWS',
      'Amazon Web Services',
      'AWS Certified',
      'AWS Developer',
      'AWS Solutions Architect',
      'AWS Lambda',
      'EC2',
      'S3',
      'Cloud Computing',
      'AWS Cloud Engineer',
    ],
  },
  {
    label: 'Docker',
    isHot: true,
    metaData: [
      'Docker',
      'Containerization',
      'Docker Compose',
      'Docker Swarm',
      'Kubernetes',
      'DevOps',
      'CI/CD',
      'Container Orchestration',
      'Cloud Infrastructure',
    ],
  },
  {
    label: 'Kubernetes',
    isHot: false,
    metaData: [
      'Kubernetes',
      'K8s',
      'Container Orchestration',
      'Cloud-Native',
      'DevOps',
      'Docker',
      'Helm',
      'Kubernetes Engineer',
    ],
  },
  {
    label: 'Machine Learning',
    isHot: true,
    metaData: [
      'Machine Learning',
      'ML',
      'Artificial Intelligence',
      'AI',
      'Deep Learning',
      'Supervised Learning',
      'Unsupervised Learning',
      'TensorFlow',
      'PyTorch',
      'ML Engineer',
    ],
  },
  {
    label: 'Data Science',
    isHot: true,
    metaData: [
      'Data Science',
      'Data Analysis',
      'Big Data',
      'Data Scientist',
      'Python for Data Science',
      'SQL for Data Science',
      'pandas',
      'Machine Learning',
      'R',
      'Data Visualization',
    ],
  },
  {
    label: 'TensorFlow',
    isHot: false,
    metaData: [
      'TensorFlow',
      'Deep Learning',
      'AI',
      'ML',
      'Neural Networks',
      'Machine Learning Engineer',
      'TF',
    ],
  },
  {
    label: 'PyTorch',
    isHot: false,
    metaData: [
      'PyTorch',
      'Deep Learning',
      'Neural Networks',
      'Machine Learning',
      'AI',
      'Torch',
      'PyTorch Engineer',
    ],
  },
  {
    label: 'Java',
    isHot: false,
    metaData: [
      'Java',
      'Java Developer',
      'Spring Boot',
      'JVM',
      'Microservices',
      'Java EE',
      'JPA',
      'Hibernate',
    ],
  },
  {
    label: 'C#',
    isHot: false,
    metaData: [
      'C#',
      'CSharp',
      '.NET',
      'ASP.NET',
      'Entity Framework',
      'Game Development',
      'Unity',
      'Windows Development',
    ],
  },
  {
    label: 'Angular',
    isHot: false,
    metaData: [
      'Angular',
      'Angular.js',
      'Frontend Development',
      'Angular Developer',
      'RxJS',
      'TypeScript',
      'Single Page Applications',
    ],
  },
  {
    label: 'Vue.js',
    isHot: false,
    metaData: [
      'Vue.js',
      'Vue',
      'Frontend Development',
      'Vue Developer',
      'Vuex',
      'Nuxt.js',
      'Single Page Applications',
    ],
  },
  {
    label: 'DevOps',
    isHot: true,
    metaData: [
      'DevOps',
      'DevOps Engineer',
      'CI/CD',
      'Infrastructure as Code',
      'Kubernetes',
      'Cloud Engineering',
      'AWS DevOps',
    ],
  },
  {
    label: 'CI/CD',
    isHot: false,
    metaData: [
      'CI/CD',
      'Continuous Integration',
      'Continuous Deployment',
      'Jenkins',
      'GitHub Actions',
      'GitLab CI',
      'DevOps',
    ],
  },
  {
    label: 'Cloud Architecture',
    isHot: true,
    metaData: [
      'Cloud Architecture',
      'Cloud Engineer',
      'AWS Solutions Architect',
      'Cloud Computing',
      'Infrastructure as Code',
    ],
  },
  {
    label: 'Data Engineering',
    isHot: true,
    metaData: [
      'Data Engineering',
      'Big Data',
      'ETL',
      'Apache Spark',
      'SQL for Data Engineering',
      'Data Pipelines',
      'Hadoop',
    ],
  },
  {
    label: 'UI/UX Design',
    isHot: false,
    metaData: [
      'UI/UX Design',
      'User Interface',
      'User Experience',
      'Figma',
      'Adobe XD',
      'Wireframing',
      'Prototyping',
      'UX Research',
    ],
  },
  {
    label: 'GraphQL',
    isHot: false,
    metaData: [
      'GraphQL',
      'GraphQL API',
      'Apollo',
      'Relay',
      'Backend Development',
      'API Development',
    ],
  },
  {
    label: 'MongoDB',
    isHot: false,
    metaData: ['MongoDB', 'NoSQL', 'Database Management', 'Mongoose', 'MongoDB Atlas'],
  },
  {
    label: 'PostgreSQL',
    isHot: false,
    metaData: [
      'PostgreSQL',
      'Postgres',
      'Relational Database',
      'SQL',
      'Database Engineer',
      'pgAdmin',
    ],
  },
  {
    label: 'Cybersecurity',
    isHot: true,
    metaData: [
      'Cybersecurity',
      'Information Security',
      'Ethical Hacking',
      'Penetration Testing',
      'SOC Analyst',
      'Network Security',
    ],
  },
  {
    label: 'Blockchain',
    isHot: false,
    metaData: ['Blockchain', 'Cryptocurrency', 'Smart Contracts', 'Ethereum', 'Solidity', 'DeFi'],
  },
  {
    label: 'Mobile Development',
    isHot: false,
    metaData: [
      'Mobile Development',
      'iOS Development',
      'Android Development',
      'Swift',
      'Kotlin',
      'React Native',
      'Flutter',
    ],
  },
  {
    label: 'React Native',
    isHot: false,
    metaData: [
      'React Native',
      'Mobile App Development',
      'Cross-Platform Development',
      'React',
      'Expo',
    ],
  },
  {
    label: 'Flutter',
    isHot: false,
    metaData: ['Flutter', 'Dart', 'Mobile App Development', 'Cross-Platform Apps'],
  },
  {
    label: 'Data Analysis',
    isHot: false,
    metaData: ['Data Analysis', 'Data Scientist', 'Data Analyst', 'Data Engineer'],
  },
  {
    label: 'Terraform',
    isHot: false,
    metaData: [
      'Terraform',
      'Infrastructure as Code',
      'Cloud Automation',
      'AWS',
      'Azure',
      'Google Cloud',
      'Terraform Engineer',
    ],
  },
  {
    label: 'Figma',
    isHot: true,
    metaData: ['Figma', 'UI/UX Design', 'Design Tools', 'Prototyping', 'Wireframing'],
  },
  {
    label: 'Adobe XD',
    isHot: true,
    metaData: ['Adobe XD', 'UI/UX Design', 'Design Tools', 'Prototyping'],
  },
  {
    label: 'User Research',
    isHot: true,
    metaData: ['User Research', 'User Testing', 'User Feedback', 'User Testing', 'User Feedback'],
  },
  {
    label: 'Design Systems',
    isHot: true,
    metaData: [
      'Design Systems',
      'Design Tokens',
      'Design Patterns',
      'Design Systems',
      'Design Tokens',
    ],
  },
  {
    label: 'Redux',
    isHot: true,
    metaData: ['Redux', 'Redux Toolkit', 'Redux Saga', 'Redux Thunk', 'Redux Toolkit'],
  },
  {
    label: 'API Design',
    isHot: true,
    metaData: ['API Design', 'API Development', 'API Documentation', 'API Testing', 'API Testing'],
  },
  {
    label: 'ETL',
    isHot: true,
    metaData: [
      'ETL',
      'Extract Transform Load',
      'Data Integration',
      'Data Pipeline',
      'Data Pipeline',
    ],
  },
  {
    label: 'QA Automation',
    isHot: true,
    metaData: ['QA Automation', 'QA Testing', 'QA Engineer', 'QA Automation Engineer'],
  },
  {
    label: 'Selenium',
    isHot: true,
    metaData: ['Selenium', 'Selenium Testing', 'Selenium Automation', 'Selenium Engineer'],
  },
  {
    label: 'Cypress',
    isHot: true,
    metaData: ['Cypress', 'Cypress Testing', 'Cypress Automation', 'Cypress Engineer'],
  },
  {
    label: 'Mobile',
    isHot: true,
    metaData: ['Mobile', 'Mobile Development', 'Mobile App Development', 'Mobile Engineer'],
  },
  {
    label: 'Roadmapping',
    isHot: true,
    metaData: ['Roadmapping', 'Roadmap', 'Roadmap Development', 'Roadmap Engineer'],
  },
];

// IT-focused job categories
const JOB_CATEGORIES = [
  'Software Development',
  'Data Science & Analytics',
  'DevOps & Cloud',
  'UI/UX Design',
  'Cybersecurity',
  'Mobile Development',
  'AI & Machine Learning',
  'Database Administration',
  'IT Project Management',
  'Technical Writing',
];

// IT-focused industries
const IT_INDUSTRIES = [
  {
    label: 'Software Development',
    metadata: [
      'Software Development',
      'Software Engineering',
      'Software Architect',
      'Software Developer',
      'Software Engineer',
      'Software Programmer',
      'Programmer',
      'Developer',
      'Programming',
      'Web Development',
      'Mobile Development',
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
    ],
  },
  {
    label: 'Data Analytics',
    metadata: [
      'Data Analytics',
      'Data Science',
      'Data Engineer',
      'Data Analyst',
      'Data Scientist',
      'Data Visualization',
      'Data Reporting',
      'Data Modeling',
      'Data Warehousing',
      'Data Integration',
      'Data Cleaning',
      'Data Transformation',
    ],
  },
  {
    label: 'Cloud Services',
    metadata: [
      'Cloud Services',
      'Cloud Computing',
      'Cloud Platform',
      'Cloud Storage',
      'Cloud Security',
      'Cloud Management',
      'Cloud Monitoring',
      'Cloud Automation',
      'Cloud Optimization',
      'Cloud Migration',
      'Cloud Deployment',
      'Cloud Configuration',
    ],
  },
  {
    label: 'Artificial Intelligence',
    metadata: [
      'Artificial Intelligence',
      'AI',
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
      'AI Ethics',
      'AI Governance',
      'AI Security',
      'AI Optimization',
      'AI Governance',
      'AI Security',
      'AI Optimization',
      'AI Governance',
      'AI Security',
      'AI Optimization',
    ],
  },
  {
    label: 'Cybersecurity',
    metadata: [
      'Cybersecurity',
      'Computer Security',
      'Penetration Testing',
      'Ethical Hacking',
      'Injection Attacks',
      'SQL Injection',
      'XSS Attacks',
      'CSRF Attacks',
      'DDOS Attacks',
      'Phishing Attacks',
      'Social Engineering',
    ],
  },
  {
    label: 'E-commerce',
    metadata: [
      'E-commerce',
      'Online Shopping',
      'Online Store',
      'Online Shopping',
      'Online Store',
      'E-commerce Platform',
      'E-commerce Website',
      'E-commerce Store',
      'E-commerce Shopping',
      'E-commerce Shopping',
      'E-commerce Shopping',
      'E-commerce Shopping',
    ],
  },
  {
    label: 'FinTech',
    metadata: ['FinTech', 'Financial Technology', 'Financial Services'],
  },
  {
    label: 'HealthTech',
    metadata: ['HealthTech', 'Health Technology', 'Healthcare Technology', 'Healthcare Services'],
  },
  {
    label: 'EdTech',
    metadata: [
      'EdTech',
      'Education Technology',
      'Education Services',
      'Online Education',
      'Online Learning',
      'Online Courses',
      'Online Tutorials',
      'Online Training',
      'Online Certification',
      'Online Degree',
      'Online Certificate',
    ],
  },
  {
    label: 'IoT',
    metadata: [
      'IoT',
      'Internet of Things',
      'IoT Devices',
      'IoT Sensors',
      'IoT Devices',
      'IoT Applications',
      'IoT Solutions',
      'IoT Platforms',
      'IoT Services',
      'IoT Development',
      'IoT Integration',
    ],
  },
];

const PROFILE_IMAGES = {
  developer: [
    'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800',
    'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800',
  ],
  company: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  ],
  portfolio: {
    webDev: [
      'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    ],
    dataScience: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ],
    ai: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      'https://images.unsplash.com/photo-1675557009875-476ea25ea75d?w=800',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    ],
    cybersecurity: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    ],
  },
  certificates: {
    aws: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800',
    google: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800',
    microsoft: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=800',
    cisco: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800',
  },
};

async function seed() {
  await db.transaction(async tx => {
    try {
      // Clear existing data to avoid conflicts
      // Note: Order matters due to foreign key constraints
      await tx.delete(freelancerSkillsTable);
      await tx.delete(jobSkillsTable);
      await tx.delete(freelancerLanguagesTable);
      await tx.delete(jobApplicationsTable);
      await tx.delete(jobsTable);
      await tx.delete(freelancersTable);
      await tx.delete(employersTable);
      await tx.delete(accountsTable);
      await tx.delete(userVerificationsTable);
      await tx.delete(UsersTable);
      await tx.delete(skillsTable);
      await tx.delete(languagesTable);
      await tx.delete(industriesTable);
      await tx.delete(jobCategoriesTable);

      // Reset sequences for all tables
      await tx.execute(sql`
        ALTER SEQUENCE users_id_seq RESTART WITH 1;
        ALTER SEQUENCE accounts_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancers_id_seq RESTART WITH 1;
        ALTER SEQUENCE employers_id_seq RESTART WITH 1;
        ALTER SEQUENCE languages_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancer_languages_id_seq RESTART WITH 1;
        ALTER SEQUENCE industries_id_seq RESTART WITH 1;
        ALTER SEQUENCE skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE jobs_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancer_skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_categories_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_applications_id_seq RESTART WITH 1;
        ALTER SEQUENCE user_verifications_id_seq RESTART WITH 1;
      `);

      // Seed Languages
      for (const language of [
        'English',
        'Spanish',
        'French',
        'German',
        'Chinese',
        'Japanese',
        'Arabic',
        'Russian',
        'Portuguese',
        'Hindi',
      ]) {
        await tx.insert(languagesTable).values({
          language: language,
        });
      }

      for (const industry of IT_INDUSTRIES) {
        await tx.insert(industriesTable).values({
          label: industry.label,
          metadata: industry.metadata,
        });
      }

      const adminPassword = '123';
      const hashedPassword = await hash(adminPassword, 10);

      await insertUser(tx, {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mawaheb.com',
        passHash: hashedPassword,
        isVerified: true,
        isOnboarded: true,
        role: 'admin',
        provider: Provider.Credentials,
      });

      const skillIdMap = new Map();

      for (let i = 0; i < IT_SKILLS.length; i++) {
        const skill = IT_SKILLS[i];
        const result = await tx
          .insert(skillsTable)
          .values({
            label: skill.label,
            isHot: skill.isHot,
          })
          .returning({ id: skillsTable.id });

        // Store the actual DB ID for each skill label
        skillIdMap.set(skill.label, result[0].id);
      }

      // Seed Job Categories
      console.log('Seeding job categories...');
      for (const category of JOB_CATEGORIES) {
        await tx.insert(jobCategoriesTable).values({
          name: category,
        });
      }

      const freelancerEmails = [
        'freelancer1@example.com',
        'freelancer2@example.com',
        'freelancer3@example.com',
        'freelancer4@example.com',
      ];

      const freelancerIds = [];

      for (let i = 0; i < freelancerEmails.length; i++) {
        const profile = FREELANCER_PROFILES[i];

        // Create user
        const userResult = await insertUser(tx, {
          firstName: profile.name.split(' ')[0],
          lastName: profile.name.split(' ')[1],
          email: freelancerEmails[i],
          passHash: await hash('123', 10),
          isVerified: true,
          isOnboarded: true,
          provider: Provider.Credentials,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning({ id: UsersTable.id });

        const userId = userResult[0].id;

        // Create account
        const accountResult = await tx
          .insert(accountsTable)
          .values({
            userId: userId,
            accountType: AccountType.Freelancer,
            location: faker.location.city(),
            country: faker.location.country(),
            region: faker.location.state(),
            accountStatus: AccountStatus.Published,
            phone: faker.phone.number(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: accountsTable.id });

        const accountId = accountResult[0].id;

        // Prepare portfolio projects
        const portfolioProjects = [];
        for (let j = 0; j < 3; j++) {
          let projectImages;
          if (
            profile.expertise.includes('Web Development') ||
            profile.expertise.includes('JavaScript')
          ) {
            projectImages = PROFILE_IMAGES.portfolio.webDev;
          } else if (profile.expertise.includes('Data Science')) {
            projectImages = PROFILE_IMAGES.portfolio.dataScience;
          } else if (profile.expertise.includes('AI')) {
            projectImages = PROFILE_IMAGES.portfolio.ai;
          } else {
            projectImages = PROFILE_IMAGES.portfolio.cybersecurity;
          }

          portfolioProjects.push({
            projectName: `${profile.expertise[j % profile.expertise.length]} Project ${j + 1}`,
            projectLink: `https://github.com/${profile.name.replace(' ', '').toLowerCase()}/project-${j + 1}`,
            projectDescription: `A ${profile.expertise[j % profile.expertise.length]} project that demonstrates my skills in ${profile.skills[j % profile.skills.length].name}. This project involved complex problem-solving and collaboration with a team of developers.`,
            projectImageName: `project${j + 1}.jpg`,
            projectImageUrl: projectImages[j % projectImages.length],
            attachmentName: `project${j + 1}_details.pdf`,
            attachmentUrl: `https://drive.google.com/file/d/1234567890${j}/view`,
          });
        }

        // Prepare work history
        const workHistory = [];
        for (const job of profile.workHistory) {
          const startDate = faker.date.past({ years: 5 }).toISOString().split('T')[0];
          const endDate = job.currentlyWorkingThere
            ? null
            : faker.date.past({ years: 2 }).toISOString().split('T')[0];

          workHistory.push({
            title: job.title,
            company: job.company,
            currentlyWorkingThere: job.currentlyWorkingThere,
            startDate: startDate,
            endDate: endDate,
            jobDescription: job.jobDescription,
          });
        }

        // Prepare certificates
        const certificates = [];
        for (const cert of profile.certificates) {
          let certImageUrl;
          if (cert.name.toLowerCase().includes('aws')) {
            certImageUrl = PROFILE_IMAGES.certificates.aws;
          } else if (cert.name.toLowerCase().includes('google')) {
            certImageUrl = PROFILE_IMAGES.certificates.google;
          } else if (cert.name.toLowerCase().includes('microsoft')) {
            certImageUrl = PROFILE_IMAGES.certificates.microsoft;
          } else {
            certImageUrl = PROFILE_IMAGES.certificates.cisco;
          }

          certificates.push({
            name: cert.name,
            issuer: cert.issuer,
            credentialId: cert.credentialId,
            credentialURL: cert.credentialURL,
            certificateImageUrl: certImageUrl,
            issueDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
          });
        }

        // Prepare education
        const educations = [];
        for (const edu of profile.education) {
          const startDate = faker.date.past({ years: 10 }).toISOString().split('T')[0];
          const endDate = faker.date.past({ years: 5 }).toISOString().split('T')[0];

          educations.push({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: startDate,
            endDate: endDate,
            description: edu.description,
          });
        }

        // Create freelancer
        const freelancerResult = await tx
          .insert(freelancersTable)
          .values({
            accountId: accountId,
            about: profile.about,
            fieldsOfExpertise: profile.expertise,
            portfolio: portfolioProjects,
            workHistory: workHistory,
            cvLink: `https://example.com/cv/${profile.name.replace(' ', '_')}.pdf`,
            videoLink: `https://example.com/intro/${profile.name.replace(' ', '_')}.mp4`,
            certificates: certificates,
            educations: educations,
            yearsOfExperience: profile.yearsOfExperience,
            preferredProjectTypes: [ProjectType.LongTerm, ProjectType.ShortTerm],
            hourlyRate: profile.hourlyRate,
            compensationType: CompensationType.HourlyRate,
            availableForWork: true,
            dateAvailableFrom: faker.date.soon({ days: 10 }).toISOString().split('T')[0],
            jobsOpenTo: [JobsOpenTo.FullTimeRoles, JobsOpenTo.PartTimeRoles],
            hoursAvailableFrom: '09:00:00',
            hoursAvailableTo: '17:00:00',
          })
          .returning({ id: freelancersTable.id });

        const freelancerId = freelancerResult[0].id;
        freelancerIds.push(freelancerId);

        // Add languages for freelancer
        for (const language of profile.languages) {
          const languageId = profile.languages.indexOf(language) + 1;
          await tx.insert(freelancerLanguagesTable).values({
            freelancerId: freelancerId,
            languageId: languageId,
          });
        }

        // Add skills for freelancer
        for (const skill of profile.skills) {
          // Get the actual skill ID from our map
          const skillId = skillIdMap.get(skill.name);

          if (skillId) {
            await tx.insert(freelancerSkillsTable).values({
              freelancerId: freelancerId,
              skillId: skillId,
              yearsOfExperience: skill.years,
            });
          } else {
            console.warn(`Warning: Skill "${skill.name}" not found in database. Skipping.`);
          }
        }
      }

      // Create employer accounts
      console.log('Creating employer accounts...');
      const employerEmails = ['employer1@example.com', 'employer2@example.com'];
      const employerIds = [];

      for (let i = 0; i < employerEmails.length; i++) {
        const company = EMPLOYER_PROFILES[i];

        // Create user
        const userResult = await insertUser(tx, {
          firstName: `Employer${i + 1}`,
          lastName: `Admin`,
          email: employerEmails[i],
          passHash: await hash('123', 10),
          isVerified: true,
          isOnboarded: true,
          provider: Provider.Credentials,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning({ id: UsersTable.id });

        const userId = userResult[0].id;

        // Create account
        const accountResult = await tx
          .insert(accountsTable)
          .values({
            userId: userId,
            accountType: AccountType.Employer,
            location: company.location,
            country: company.location,
            region: faker.location.state(),
            accountStatus: AccountStatus.Published,
            phone: faker.phone.number(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: accountsTable.id });

        const accountId = accountResult[0].id;

        // Create employer
        const employerResult = await tx
          .insert(employersTable)
          .values({
            accountId: accountId,
            companyName: company.name,
            companyDescription: company.description,
            companySize: company.companySize,
            industrySector: company.industries[0],
            companyWebsite: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            companyEmail: `info@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            companyLogo: PROFILE_IMAGES.company[i % PROFILE_IMAGES.company.length],
            companyBanner: PROFILE_IMAGES.company[(i + 1) % PROFILE_IMAGES.company.length],
          })
          .returning({ id: employersTable.id });

        const employerId = employerResult[0].id;
        employerIds.push(employerId);

        // Create jobs for this employer
        console.log(`Creating jobs for employer ${i + 1}...`);

        // Create jobs based on company.jobs array
        for (let j = 0; j < company.jobs.length; j++) {
          const job = company.jobs[j];

          // Determine job status - make most jobs active
          let status = JobStatus.Active;
          if (j >= company.jobs.length - 4) {
            status = [JobStatus.Draft, JobStatus.Paused, JobStatus.Closed, JobStatus.Completed][
              j - (company.jobs.length - 4)
            ];
          }

          // Find job category ID based on job title
          let jobCategoryId = 1; // Default to Software Development
          if (job.title.includes('Data') || job.title.includes('Analytics')) {
            jobCategoryId = 2; // Data Science & Analytics
          } else if (job.title.includes('DevOps') || job.title.includes('Cloud')) {
            jobCategoryId = 3; // DevOps & Cloud
          } else if (
            job.title.includes('Design') ||
            job.title.includes('UI') ||
            job.title.includes('UX')
          ) {
            jobCategoryId = 4; // UI/UX Design
          } else if (job.title.includes('Security') || job.title.includes('Cyber')) {
            jobCategoryId = 5; // Cybersecurity
          } else if (
            job.title.includes('Mobile') ||
            job.title.includes('iOS') ||
            job.title.includes('Android')
          ) {
            jobCategoryId = 6; // Mobile Development
          } else if (
            job.title.includes('AI') ||
            job.title.includes('Machine Learning') ||
            job.title.includes('ML')
          ) {
            jobCategoryId = 7; // AI & Machine Learning
          } else if (job.title.includes('Database') || job.title.includes('SQL')) {
            jobCategoryId = 8; // Database Administration
          } else if (job.title.includes('Project') || job.title.includes('Manager')) {
            jobCategoryId = 9; // IT Project Management
          } else if (job.title.includes('Writer') || job.title.includes('Content')) {
            jobCategoryId = 10; // Technical Writing
          }

          // Create the job
          const jobResult = await tx
            .insert(jobsTable)
            .values({
              employerId: employerId,
              title: job.title,
              description: job.description,
              jobCategoryId: jobCategoryId,
              workingHoursPerWeek: job.workingHours,
              locationPreference: job.location,
              projectType: job.projectType,
              budget: job.budget,
              experienceLevel: job.experienceLevel,
              status: status,
              createdAt: faker.date.recent({ days: 30 }),
              fulfilledAt: status === JobStatus.Completed ? faker.date.recent({ days: 10 }) : null,
            })
            .returning({ id: jobsTable.id });

          const jobId = jobResult[0].id;

          // Add skills to job
          for (const skillName of job.skills) {
            // Get the actual skill ID from our map
            const skillId = skillIdMap.get(skillName);

            if (skillId) {
              // Mark some skills as starred (more important)
              const isStarred = job.skills.indexOf(skillName) < 2; // First two skills are starred

              await tx.insert(jobSkillsTable).values({
                jobId: jobId,
                skillId: skillId,
                isStarred: isStarred,
              });
            } else {
              console.warn(`Warning: Skill "${skillName}" not found in database. Skipping.`);
            }
          }
        }
      }

      // Add job applications
      console.log('Creating job applications...');

      // Get the ID of freelancer1@example.com
      const freelancer1Id = freelancerIds[0]; // First freelancer in our array

      // Loop through all jobs and create applications
      for (const employerId of employerIds) {
        // Get all jobs for this employer
        const jobsResult = await tx
          .select({ id: jobsTable.id, status: jobsTable.status })
          .from(jobsTable)
          .where(sql`${jobsTable.employerId} = ${employerId}`);

        for (const job of jobsResult) {
          // Skip applications for non-active jobs
          if (job.status !== JobStatus.Active && job.status !== JobStatus.Paused) {
            continue;
          }

          // Freelancer1 applies to all jobs
          await tx.insert(jobApplicationsTable).values({
            jobId: job.id,
            freelancerId: freelancer1Id,
            coverLetter:
              "I'm very interested in this position and believe my skills and experience make me a perfect fit. I've worked on similar projects in the past and can deliver high-quality results within your timeline. I'm particularly excited about the opportunity to work with your team on this project.",
            attachmentUrl: 'https://drive.google.com/file/d/1234567890/view',
            status: faker.helpers.arrayElement([
              JobApplicationStatus.Pending,
              JobApplicationStatus.Shortlisted,
              JobApplicationStatus.Approved,
              JobApplicationStatus.Rejected,
            ]),
            createdAt: faker.date.recent({ days: 14 }),
          });

          // Other freelancers apply to some jobs (30% chance)
          for (let i = 1; i < freelancerIds.length; i++) {
            if (faker.number.int({ min: 1, max: 10 }) <= 3) {
              // 30% chance
              await tx.insert(jobApplicationsTable).values({
                jobId: job.id,
                freelancerId: freelancerIds[i],
                coverLetter:
                  "I'm excited to apply for this position as it aligns perfectly with my expertise in " +
                  FREELANCER_PROFILES[i].expertise.join(', ') +
                  ". With my background and skills, I can deliver exceptional results for your project. I'm particularly interested in working with your company because of your focus on innovation and quality.",
                attachmentUrl: 'https://drive.google.com/file/d/1234567891/view',
                status: faker.helpers.arrayElement([
                  JobApplicationStatus.Pending,
                  JobApplicationStatus.Shortlisted,
                  JobApplicationStatus.Approved,
                  JobApplicationStatus.Rejected,
                ]),
                createdAt: faker.date.recent({ days: 10 }),
              });
            }
          }
        }
      }

      console.log('Job applications created successfully!');

      console.log('Seeding completed successfully!');
    } catch (err) {
      console.error('Error during seeding:', err);
      tx.rollback();
      throw err;
    }
  });
}

seed()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seeding process completed.');
    process.exit(0);
  });
