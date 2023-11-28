export interface Review {
    review_id?: number;
    user_id?: number;
    list_id: number;
    rating: number;
    comment?: string;
    hidden?: boolean;
    username?: string;
}