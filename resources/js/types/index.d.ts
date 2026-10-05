// types.ts
import type { FormDataErrors } from '@inertiajs/core';
import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    permissions: string[];
    roles: string[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
};

export type Role = {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
};

export type RelatedUsersPayload = {
    gakuseis: (User & { sensei?: User })[];
    senseis: (User & { gakuseis?: User[] })[];
};

export type DataType = {
    name: string;
    email: string;
    roles: string[];
    related_users: User[];
};

export type RelatedUsersType = {
    related_users?: RelatedUsersPayload;
    ours?: User[];
    data: DataType;
    handleCheckboxes: (checked: boolean, user: User) => void;
    handleRadio: (user: User) => void;
    errors: FormDataErrors<{
        related_users: User[];
    }>;
    selectedRole: string;
    whoAmI: User;
};

export interface MultipleListProps {
    user: User & { sensei?: User };
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean, user: User) => void;
}

export interface RadioListProps {
    user: User & { gakuseis?: User[] };
    checked: boolean;
    onChange: (user: User) => void;
}

export interface TaskCardProps {
    title: string;
    desc: string;
    progress: number;
    icon: string;
    colorClass: string;
    gradientClass: string;
}

export interface PersonCardProps {
    url: string;
    name: string;
    alt: string;
    info: string;
}

export interface UnderLinkProps {
    children: string;
    href: string;
    active: boolean;
}

export type UploadType = {
    materials: PaginatedMaterials;
};

// 1. Define what a SINGLE raw material node looks like
export interface LearningMaterial {
    id: string;
    title: string;
    img?: string;
    type:
    | 'Видеокурс'
    | 'Документ PDF'
    | 'Лаб. руководство'
    | 'Подкаст'
    | 'Системная матрица'
    | 'Аппаратная схема';
    typeIcon: string;
    iconColor?: string;
    file_path: string;
}

// 2. Define the structural matrix wrapper for Laravel's LengthAwarePaginator payload
export interface PaginatedMaterials {
    data: LearningMaterial[]; // The backend sends the array here
    first_page_url: string;
    from: number;
    last_page_url: string;
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
}

export interface PaginatedTest {
    data: Test[];
    first_page_url: string;
    from: number;
    last_page_url: string;
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
}
export interface CoverProps {
    item: LearningMaterial;
}
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// types/index.d.ts (or wherever your types are stored)

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[]; // The actual array of models
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
export interface PaginatedDataProps<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface UserIndexProps {
    auth: PageProps['auth'];
    users: User[] | PaginatedDataProps<User>;
    roleLabels: Record<string, string>;
}

export interface TestMaterial {
    id: number;
    title: string;
    link: string;
}

export interface Test {
    id: number;
    title: string;
    description: string | null;
    content: TestContent;
    is_published: boolean;
    user_id: number;
    user?: User;
    questions_count?: number;
    created_at: string;
    updated_at: string;
    materials?: TestMaterial[];
}

export interface FlashProps {
    message?: string | null;
    success?: string | null;
    error?: {
        summary: string | null;
        details: string[] | null;
    } | null;
    generated_users?: any; // Add specific user type here if applicable
}
export interface ErrorTelemetryProps {
    summary: string | null;
    details: string[] | null;
    onClear: () => void;
}

export interface PageUser extends PageProps {
    user: User;
}

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionItem {
    id: string;
    text: string;
    value: number;
    options: AnswerOption[];
}

export interface Test {
    id: number;
    title: string;
    description?: string;
    minPoints: number;
    maxPoints: number; // <-- Add this property
    content?: QuestionItem[] | { questions: QuestionItem[] };
    questions?: QuestionItem[];
}
