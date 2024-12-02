export interface User {
    id: number;
    login: string;
    email: string;
    full_name: string;
    profile_picture_url: string;
    role: string;
    rating: number;
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    likes: number;
    dislikes: number;
    user?: User;
}
