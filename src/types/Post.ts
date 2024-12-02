export interface User {
    id: number;
    login: string;
    email: string;
    full_name: string;
    profile_picture_url: string;
    role: string;
    rating: number;
}

export interface Category {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

export interface Post {
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    title: string;
    status: string;
    content: string;
    rating: number;
    likes: number;
    dislikes: number;
    category_ids: number[];
    isFavourite?: boolean;
    user?: User;
    categories?: Category[];
}
